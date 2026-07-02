<script setup>
import { ref, computed, onMounted } from 'vue'
import client from '../api/client'
import { fmtLong, parseDateOnly, currentStageFor, dayOfGestationFor, statusFor } from '../utils/feeding'

const swines = ref([])
const loading = ref(true)
const loadError = ref('')

const today = new Date()

onMounted(async () => {
  try {
    const res = await client.get('/swines')
    swines.value = res.data
  } catch (err) {
    loadError.value = 'Could not load swine records. Is the API running?'
  } finally {
    loading.value = false
  }
})

const activeSwine = computed(() => {
  const active = swines.value
    .map((s) => ({ swine: s, breedDate: parseDateOnly(String(s.breeding_date).slice(0, 10)) }))
    .filter(({ breedDate }) => {
      const day = dayOfGestationFor(breedDate)
      return day >= 1 && day <= 118
    })
  return active[0] || null
})

const stage = computed(() => (activeSwine.value ? currentStageFor(activeSwine.value.breedDate) : null))
const status = computed(() => (activeSwine.value ? statusFor(activeSwine.value.breedDate) : null))
</script>

<template>
  <div class="page">
    <header class="masthead">
      <p class="eyebrow">Farrowing record</p>
      <h1>Home</h1>
      <p class="subtitle">{{ fmtLong(today) }}</p>
    </header>

    <p v-if="loading" class="empty-state">Loading current feeding program...</p>
    <p v-else-if="loadError" class="empty-state">{{ loadError }}</p>

    <template v-else-if="activeSwine">
      <h2 class="section-title">{{ activeSwine.swine.swine_name }}</h2>
      <section class="ledger-grid">
        <div class="ledger-card accent">
          <p class="ledger-label">Current gestation day</p>
          <p class="ledger-value large">Day {{ dayOfGestationFor(activeSwine.breedDate) }}</p>
        </div>
        <div class="ledger-card accent">
          <p class="ledger-label">{{ status.label }}</p>
          <p class="ledger-value large">{{ status.value }}</p>
        </div>
      </section>

      <section v-if="stage" class="ledger-grid">
        <div class="ledger-card">
          <p class="ledger-label">Current feeding stage</p>
          <p class="ledger-value">{{ stage.label }} · {{ stage.range }}</p>
        </div>
        <div class="ledger-card">
          <p class="ledger-label">Feed amount</p>
          <p class="ledger-value">{{ stage.kg.toFixed(2) }} kg/day</p>
        </div>
      </section>
      <p v-if="stage" class="stage-note">{{ stage.note }}</p>
    </template>

    <p v-else class="empty-state">
      No active feeding program. Add a swine on the Swine calculator page to see the current program here.
    </p>
  </div>
</template>

<style scoped>
.section-title {
  font-size: 20px;
  color: var(--barn);
  margin: 0 0 1rem;
}

.stage-note {
  font-size: 14px;
  color: var(--ink-soft);
}
</style>
