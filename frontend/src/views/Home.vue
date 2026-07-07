<script setup>
import { ref, computed, onMounted } from 'vue'
import client from '../api/client'
import { fmtLong, fmtShort, parseDateOnly, currentStageFor, dayOfGestationFor, statusFor } from '../utils/feeding'

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

// All swines currently within their gestation-to-labor window (day 1 to day 118),
// each enriched with its parsed breeding date, current gestation day, status, and stage.
const activeSwines = computed(() => {
  return swines.value
    .map((s) => {
      const breedDate = parseDateOnly(String(s.breeding_date).slice(0, 10))
      const day = dayOfGestationFor(breedDate)
      return {
        swine: s,
        breedDate,
        day,
        status: statusFor(breedDate),
        stage: currentStageFor(breedDate)
      }
    })
    .filter(({ day }) => day >= 1 && day <= 118)
    .sort((a, b) => a.day - b.day)
})
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

    <template v-else-if="activeSwines.length">
      <h2 class="section-title">Active feeding programs ({{ activeSwines.length }})</h2>

      <article v-for="entry in activeSwines" :key="entry.swine.id" class="swine-block">
        <h3 class="swine-name">{{ entry.swine.swine_name }}</h3>

        <section class="ledger-grid">
          <div class="ledger-card accent">
            <p class="ledger-label">Current gestation day</p>
            <p class="ledger-value large">Day {{ entry.day }}</p>
          </div>
          <div class="ledger-card accent">
            <p class="ledger-label">{{ entry.status.label }}</p>
            <p class="ledger-value large">{{ entry.status.value }}</p>
          </div>
        </section>

        <section class="ledger-grid" v-if="fmtShort(entry.swine.pregnant_date) == fmtLong(today)">
          <div class="ledger-card">
            <p class="ledger-label">Pregnant date</p>
            <p class="ledger-value">{{ fmtShort(entry.swine.pregnant_date) }}</p>
          </div>
          <div class="ledger-card" v-if="fmtShort(entry.swine.iron_date) == fmtShort(today)">
            <p class="ledger-label">Iron date</p>
            <p class="ledger-value">{{ fmtShort(entry.swine.iron_date) }}</p>
          </div>
          <div class="ledger-card">
            <p class="ledger-label">Labor date</p>
            <p class="ledger-value">
              {{ fmtShort(entry.swine.labor_date_start) }} - {{ fmtShort(entry.swine.labor_date_end) }}
            </p>
          </div>
        </section>

        <section v-if="entry.stage" class="ledger-grid">
          <div class="ledger-card">
            <p class="ledger-label">Current feeding stage</p>
            <p class="ledger-value">{{ entry.stage.label }} · {{ entry.stage.range }}</p>
          </div>
          <div class="ledger-card">
            <p class="ledger-label">Feed amount</p>
            <p class="ledger-value">{{ entry.stage.kg.toFixed(2) }} kg/day</p>
          </div>
        </section>
        <p v-if="entry.stage" class="stage-note">{{ entry.stage.note }}</p>
      </article>
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
  margin: 0 0 1.5rem;
}

.swine-block {
  border: 1px solid var(--paper-line);
  border-radius: 8px;
  padding: 1.25rem 1.25rem 0.5rem;
  margin-bottom: 1.5rem;
  background: var(--card);
}

.swine-name {
  font-size: 18px;
  color: var(--barn);
  margin: 0 0 1rem;
}

.stage-note {
  font-size: 14px;
  color: var(--ink-soft);
}
</style>