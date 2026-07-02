<script setup>
import { ref, onMounted } from 'vue'
import client from '../api/client'
import { downloadSwinePdf } from '../utils/pdf'
import { fmtShort } from '../utils/feeding'

const swines = ref([])
const loading = ref(true)
const loadError = ref('')

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
        </tr>
      </tbody>
    </table>
  </div>
</template>
