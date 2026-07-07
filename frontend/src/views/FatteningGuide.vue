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
const editFeedState = reactive({})

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
  feedState[batchId] = { editing: true, feedName: '', amount: '', error: '' }
}

function cancelFeedEntry(batchId) {
  feedState[batchId] = { editing: false, feedName: '', amount: '', error: '' }
}

async function saveFeedEntry(batchId) {
  const entry = feedState[batchId]
  const amount = Number(entry.amount)
  if (!entry.feedName || !entry.feedName.trim()) {
    entry.error = 'Enter a feed name.'
    return
  }
  if (!entry.amount || isNaN(amount) || amount < 0) {
    entry.error = 'Enter a valid amount.'
    return
  }
  try {
    await client.post(`/fattening-batches/${batchId}/feeds`, {
      feed_name: entry.feedName.trim(),
      amount
    })
    feedState[batchId] = { editing: false, feedName: '', amount: '', error: '' }
    await loadBatches()
  } catch (err) {
    entry.error = 'Could not save the feed cost.'
  }
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}

function startEditFeed(feed) {
  editFeedState[feed.id] = { editing: true, feedName: feed.feed_name, amount: String(feed.amount), error: '' }
}

function cancelEditFeed(feedId) {
  editFeedState[feedId] = { editing: false, feedName: '', amount: '', error: '' }
}

async function saveEditFeed(feedId) {
  const entry = editFeedState[feedId]
  const amount = Number(entry.amount)
  if (!entry.feedName || !entry.feedName.trim()) {
    entry.error = 'Enter a feed name.'
    return
  }
  if (!entry.amount || isNaN(amount) || amount < 0) {
    entry.error = 'Enter a valid amount.'
    return
  }
  try {
    await client.put(`/fattening-feeds/${feedId}`, {
      feed_name: entry.feedName.trim(),
      amount
    })
    editFeedState[feedId] = { editing: false, feedName: '', amount: '', error: '' }
    await loadBatches()
  } catch (err) {
    entry.error = 'Could not save the changes.'
  }
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
          <th>Feeds lists</th>
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
                type="text"
                v-model="feedState[batch.id].feedName"
                placeholder="Feed name"
              />
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
          <td>
            <ul v-if="batch.feeds?.length" class="feeds-list">
              <li v-for="feed in batch.feeds" :key="feed.id">
                <div v-if="editFeedState[feed.id]?.editing" class="feed-edit-entry">
                  <input
                    type="text"
                    v-model="editFeedState[feed.id].feedName"
                    placeholder="Feed name"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    v-model="editFeedState[feed.id].amount"
                    placeholder="Amount"
                  />
                  <button type="button" class="primary" @click="saveEditFeed(feed.id)">Save</button>
                  <button type="button" @click="cancelEditFeed(feed.id)">Cancel</button>
                  <p v-if="editFeedState[feed.id].error" class="field-error inline">{{ editFeedState[feed.id].error }}</p>
                </div>
                <div v-else class="feed-view-entry">
                  <span>{{ feed.feed_name }} — {{ formatCurrency(feed.amount) }}</span>
                  <button type="button" class="edit-link" @click="startEditFeed(feed)">Edit</button>
                </div>
              </li>
            </ul>
            <span v-else class="feeds-list-empty">No feeds added</span>
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

.feeds-list {
  margin: 0;
  padding-left: 1rem;
  font-size: 13px;
}

.feeds-list li {
  margin-bottom: 4px;
}

.feed-view-entry {
  display: flex;
  align-items: center;
  gap: 8px;
}

.edit-link {
  padding: 2px 8px;
  font-size: 11px;
  border-color: var(--paper-line);
  color: var(--ink-soft);
}

.edit-link:hover {
  background: var(--ink);
  color: var(--paper);
}

.feed-edit-entry {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.feed-edit-entry input[type='text'] {
  min-width: 120px;
}

.feeds-list-empty {
  font-size: 13px;
  color: var(--ink-soft);
}
</style>
