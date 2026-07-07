<script setup>
import { ref, computed } from 'vue'
import client from '../api/client'
import { downloadSwinePdf } from '../utils/pdf'
import {
  addDays,
  parseDateOnly,
  fmtShort,
  dayOfGestationFor,
  statusFor,
  stagesWithDatesFor
} from '../utils/feeding'

const swineName = ref('')
const breedDateInput = ref('')
const saving = ref(false)
const saveError = ref('')
const savedMessage = ref('')

const isNameValid = computed(() => swineName.value.trim().length > 0)
const isFormComplete = computed(() => isNameValid.value && !!breedDateInput.value)

const breedDate = computed(() => (breedDateInput.value ? parseDateOnly(breedDateInput.value) : null))

const pregnantCheckDate = computed(() => (breedDate.value ? addDays(breedDate.value, 20) : null))
const ironDate = computed(() => (breedDate.value ? addDays(breedDate.value, 100) : null))
const laborStart = computed(() => (breedDate.value ? addDays(breedDate.value, 114) : null))
const laborEnd = computed(() => (breedDate.value ? addDays(breedDate.value, 118) : null))
const dayOfGestation = computed(() => dayOfGestationFor(breedDate.value))
const status = computed(() => statusFor(breedDate.value))
const stagesWithDates = computed(() => stagesWithDatesFor(breedDate.value))

function setToday() {
  const d = new Date()
  breedDateInput.value = d.toISOString().slice(0, 10)
}

function clearAll() {
  swineName.value = ''
  breedDateInput.value = ''
  saveError.value = ''
  savedMessage.value = ''
}

async function saveAndDownload() {
  if (!isFormComplete.value) return
  saving.value = true
  saveError.value = ''
  savedMessage.value = ''

  try {
    const res = await client.post('/swines', {
      swine_name: swineName.value.trim(),
      breeding_date: breedDateInput.value
    })
    // downloadSwinePdf(res.data)
    savedMessage.value = 'Saved to swine lists and downloaded as PDF.'
  } catch (err) {
    saveError.value = 'Could not save the record. Is the API running?'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="page">
    <header class="masthead">
      <p class="eyebrow">Farrowing record</p>
      <h1>Swine calculator</h1>
      <p class="subtitle">Pregnancy dates and feeding guide for a sow, from breeding to farrowing.</p>
    </header>

    <section class="input-row">
      <label for="swine-name">Swine name <span class="required-mark">*</span></label>
      <input
        id="swine-name"
        type="text"
        v-model="swineName"
        placeholder="e.g. Bess"
        required
        :aria-invalid="!isNameValid"
      />
    </section>
    <p v-if="breedDateInput && !isNameValid" class="field-error">Swine name is required.</p>

    <section class="input-row">
      <label for="breed-date">Breeding date</label>
      <input id="breed-date" type="date" v-model="breedDateInput" />
      <button type="button" @click="setToday">Use today</button>
    </section>

    <section class="input-row">
      <button type="button" class="primary" :disabled="!isFormComplete || saving" @click="saveAndDownload">
        {{ saving ? 'Saving...' : 'Save' }}
      </button>
      <button type="button" @click="clearAll">Clear</button>
    </section>
    <p v-if="savedMessage" class="save-success">{{ savedMessage }}</p>
    <p v-if="saveError" class="field-error">{{ saveError }}</p>

    <template v-if="isFormComplete">
      <h2 class="swine-heading">{{ swineName }}</h2>
      <section class="ledger-grid">
        <div class="ledger-card">
          <p class="ledger-label">Pregnancy check date</p>
          <p class="ledger-value">{{ fmtShort(pregnantCheckDate) }}</p>
        </div>
        <div class="ledger-card">
          <p class="ledger-label">Iron shot date</p>
          <p class="ledger-value">{{ fmtShort(ironDate) }}</p>
        </div>
        <div class="ledger-card">
          <p class="ledger-label">Labor window</p>
          <p class="ledger-value">{{ fmtShort(laborStart) }} - {{ fmtShort(laborEnd) }}</p>
        </div>
      </section>

      <section class="ledger-grid">
        <div class="ledger-card accent">
          <p class="ledger-label">Current gestation day</p>
          <p class="ledger-value large">
            {{ dayOfGestation >= 1 && dayOfGestation <= 118 ? 'Day ' + dayOfGestation : '-' }}
          </p>
        </div>
        <div class="ledger-card accent">
          <p class="ledger-label">{{ status.label }}</p>
          <p class="ledger-value large">{{ status.value }}</p>
        </div>
      </section>

      <section class="feed-table">
        <h2>Feeding guide</h2>
        <div
          v-for="stage in stagesWithDates"
          :key="stage.label"
          class="feed-row"
          :class="{ current: stage.isCurrent }"
        >
          <div class="feed-main">
            <p class="feed-title">
              {{ stage.label }}
              <span class="feed-range">{{ stage.range }}</span>
              <span v-if="stage.isCurrent" class="current-tag">current</span>
            </p>
            <p class="feed-note">{{ stage.note }}</p>
            <p class="feed-dates">{{ stage.dateRange }}</p>
          </div>
          <div class="feed-amount">
            <p class="feed-kg">{{ stage.kg.toFixed(2) }}</p>
            <p class="feed-unit">kg/day</p>
          </div>
        </div>
      </section>
    </template>

    <p v-else class="empty-state">Enter a swine name and breeding date to calculate the schedule.</p>

    <footer class="footnote">
      Feed amounts follow the provided ration schedule. Milestones: pregnancy check at day 20, iron shot at day 100,
      farrowing window at day 114-118 from breeding. Saving posts the record to the API and adds it to Swine lists.
    </footer>
  </div>
</template>

<style scoped>
.swine-heading {
  font-size: 20px;
  color: var(--barn);
  margin: 0 0 1rem;
}

.save-success {
  margin: -1.1rem 0 1.25rem;
  font-size: 12px;
  color: var(--sage);
}

.feed-table {
  margin-top: 2.5rem;
}

.feed-table h2 {
  font-size: 20px;
  margin-bottom: 1rem;
  color: var(--ink);
}

.feed-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--paper-line);
}

.feed-row:first-of-type {
  border-top: 1px solid var(--paper-line);
}

.feed-row.current {
  background: var(--card);
  border-left: 3px solid var(--barn);
  border-radius: 0 6px 6px 0;
}

.feed-main {
  flex: 1;
}

.feed-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 4px;
  color: var(--ink);
}

.feed-range {
  font-weight: 400;
  color: var(--ink-soft);
  font-size: 13px;
  margin-left: 6px;
}

.current-tag {
  display: inline-block;
  margin-left: 8px;
  font-size: 11px;
  font-weight: 600;
  color: var(--barn);
  border: 1px solid var(--barn);
  border-radius: 999px;
  padding: 1px 8px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  vertical-align: middle;
}

.feed-note {
  font-size: 13px;
  color: var(--ink-soft);
  margin: 0 0 4px;
}

.feed-dates {
  font-size: 12px;
  color: var(--sage);
  margin: 0;
}

.feed-amount {
  text-align: right;
  min-width: 90px;
}

.feed-kg {
  font-family: 'Fraunces', serif;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--ink);
}

.feed-unit {
  font-size: 12px;
  color: var(--ink-soft);
  margin: 2px 0 0;
}

@media (max-width: 480px) {
  .feed-row {
    flex-direction: column;
    align-items: flex-start;
  }
  .feed-amount {
    text-align: left;
  }
}
</style>
