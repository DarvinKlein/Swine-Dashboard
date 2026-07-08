import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'swine-dashboard-production.up.railway.app'
})

export default client
