<script setup>
import { ref, reactive, onMounted } from 'vue'
import client from '../api/client'

const batches = ref([])
const loading = ref(true)
const loadError = ref('')

const numberOfHeads = ref('')
const adding = ref(false)
const addError = ref('')

const feedState = reactive({})

async function loadBatches() {
  loading.value = true
  loadError.value = ''
  try {
    const res = await client.get('/fattening-batches')
    batches.value = res.data
  } catch (err) {
    loadError.value = 'Could not load fattening batches. Is the API running?'
  } finally {
    loading.value = false
  }
}

onMounted(loadBatches)

async function addBatch() {
  const heads = Number(numberOfHeads.value)
  if (!heads || heads < 1) {
    addError.value = 'Enter a valid number of heads.'
    return
  }
  adding.value = true
  addError.value = ''
  try {
    await client.post('/fattening-batches', { number_of_heads: heads })
    numberOfHeads.value = ''
    await loadBatches()
  } catch (err) {
    addError.value = 'Could not add the batch.'
  } finally {
    adding.value = false
  }
}

function startFeedEntry(batchId) {
  feedState[batchId] = { editing: true, amount: '', error: '' }
}

function cancelFeedEntry(batchId) {
  feedState[batchId] = { editing: false, amount: '', error: '' }
}

async function saveFeedEntry(batchId) {
  const entry = feedState[batchId]
  const amount = Number(entry.amount)
  if (!entry.amount || isNaN(amount) || amount < 0) {
    entry.error = 'Enter a valid amount.'
    return
  }
  try {
    await client.post(`/fattening-batches/${batchId}/feeds`, { amount })
    feedState[batchId] = { editing: false, amount: '', error: '' }
    await loadBatches()
  } catch (err) {
    entry.error = 'Could not save the feed cost.'
  }
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}
</script>

<template>
  <div class="page">
    <header class="masthead">
      <p class="eyebrow">Farrowing record</p>
      <h1>Fattening guide</h1>
      <p class="subtitle">Track fattening batches by number of heads and their running feed cost.</p>
    </header>

    <section class="input-row">
      <label for="heads">Number of heads</label>
      <input id="heads" type="number" min="1" step="1" v-model="numberOfHeads" placeholder="e.g. 20" />
      <button type="button" class="primary" :disabled="adding" @click="addBatch">
        {{ adding ? 'Adding...' : 'Add' }}
      </button>
    </section>
    <p v-if="addError" class="field-error">{{ addError }}</p>

    <p v-if="loading" class="empty-state">Loading batches...</p>
    <p v-else-if="loadError" class="empty-state">{{ loadError }}</p>
    <p v-else-if="!batches.length" class="empty-state">No fattening batches yet. Add one above.</p>

    <table v-else class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Number of heads</th>
          <th>Add feed</th>
          <th>Total cost</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="batch in batches" :key="batch.id">
          <td>{{ batch.id }}</td>
          <td>{{ batch.number_of_heads }}</td>
          <td>
            <div v-if="feedState[batch.id]?.editing" class="feed-entry">
              <input
                type="number"
                min="0"
                step="0.01"
                v-model="feedState[batch.id].amount"
                placeholder="Amount"
              />
              <button type="button" class="primary" @click="saveFeedEntry(batch.id)">Save</button>
              <button type="button" @click="cancelFeedEntry(batch.id)">Cancel</button>
              <p v-if="feedState[batch.id].error" class="field-error inline">{{ feedState[batch.id].error }}</p>
            </div>
            <button v-else type="button" @click="startFeedEntry(batch.id)">Add feed</button>
          </td>
          <td>{{ formatCurrency(batch.total_cost) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.feed-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.field-error.inline {
  margin: 0;
  width: 100%;
}
</style>
