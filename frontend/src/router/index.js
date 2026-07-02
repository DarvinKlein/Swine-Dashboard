import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import SwineCalculator from '../views/SwineCalculator.vue'
import SwineList from '../views/SwineList.vue'
import FatteningGuide from '../views/FatteningGuide.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/calculator', name: 'calculator', component: SwineCalculator },
    { path: '/swine-list', name: 'swine-list', component: SwineList },
    { path: '/fattening-guide', name: 'fattening-guide', component: FatteningGuide }
  ]
})

export default router
