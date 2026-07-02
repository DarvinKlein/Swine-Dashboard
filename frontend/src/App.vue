<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="brand">
        <p class="brand-eyebrow">Farrowing record</p>
        <h1 class="brand-title">Swine dashboard</h1>
      </div>
      <nav class="nav">
        <RouterLink to="/" class="nav-link" active-class="active">Home</RouterLink>
        <RouterLink to="/calculator" class="nav-link" active-class="active">Swine calculator</RouterLink>
        <RouterLink to="/swine-list" class="nav-link" active-class="active">Swine lists</RouterLink>
        <RouterLink to="/fattening-guide" class="nav-link" active-class="active">Fattening guide</RouterLink>
      </nav>
    </aside>
    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.shell {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
  background: var(--card);
  border-right: 1px solid var(--paper-line);
  padding: 2rem 1.5rem;
}

.brand {
  border-bottom: 2px solid var(--ink);
  padding-bottom: 1.25rem;
  margin-bottom: 1.5rem;
}

.brand-eyebrow {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--barn);
  margin: 0 0 0.4rem;
  font-weight: 600;
}

.brand-title {
  font-family: 'Fraunces', serif;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--ink);
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-link {
  display: block;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 14px;
  color: var(--ink-soft);
  text-decoration: none;
}

.nav-link:hover {
  background: var(--paper);
  color: var(--ink);
}

.nav-link.active {
  background: var(--barn);
  color: var(--paper);
  font-weight: 600;
}

.content {
  flex: 1;
  min-width: 0;
}

@media (max-width: 720px) {
  .shell {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--paper-line);
  }
  .nav {
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>
