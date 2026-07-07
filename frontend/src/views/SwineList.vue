<script setup>
import { ref, onMounted } from 'vue'
import client from '../api/client'
import { downloadSwinePdf } from '../utils/pdf'
import { fmtShort } from '../utils/feeding'

const swines = ref([])
const loading = ref(true)
const loadError = ref('')
const deletingId = ref(null)

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

function handleSavePdf(swine) {
  downloadSwinePdf(swine)
}

async function handleDelete(swine) {
  const confirmed = window.confirm(`Delete the record for "${swine.swine_name}"? This cannot be undone.`)
  if (!confirmed) return

  deletingId.value = swine.id
  try {
    await client.delete(`/swines/${swine.id}`)
    swines.value = swines.value.filter((s) => s.id !== swine.id)
  } catch (err) {
    window.alert('Could not delete this record. Please try again.')
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <div class="page">
    <header class="masthead">
      <p class="eyebrow">Farrowing record</p>
      <h1>Swine lists</h1>
      <p class="subtitle">All swine records saved from the Swine calculator page.</p>
    </header>

    <p v-if="loading" class="empty-state">Loading records...</p>
    <p v-else-if="loadError" class="empty-state">{{ loadError }}</p>
    <p v-else-if="!swines.length" class="empty-state">
      No swine records saved yet. Save one from the Swine calculator page.
    </p>

    <table v-else class="data-table">
      <thead>
        <tr>
          <th>Swine ID</th>
          <th>Swine name</th>
          <th>Pregnant date</th>
          <th>Iron date</th>
          <th>Labor date</th>
          <th>Save as PDF</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="swine in swines" :key="swine.id">
          <td>{{ swine.id }}</td>
          <td>{{ swine.swine_name }}</td>
          <td>{{ fmtShort(swine.pregnant_date) }}</td>
          <td>{{ fmtShort(swine.iron_date) }}</td>
          <td>{{ fmtShort(swine.labor_date_start) }} - {{ fmtShort(swine.labor_date_end) }}</td>
          <td><button type="button" @click="handleSavePdf(swine)">Save as PDF</button></td>
          <td>
            <button
              type="button"
              class="danger"
              :disabled="deletingId === swine.id"
              @click="handleDelete(swine)"
            >
              {{ deletingId === swine.id ? 'Deleting...' : 'Delete' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
button.danger {
  border-color: var(--barn);
  color: var(--barn);
}

button.danger:hover {
  background: var(--barn);
  color: var(--paper);
}
</style>