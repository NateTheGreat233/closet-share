<script setup lang="ts">
import Search from "../Search/Search.vue";
</script>

<template>
  <main>
    <div class="container">
      <div class="top-row">
        <h1>my groups</h1>
        <Search :inputWidth="'200px'" />
      </div>
      <div class="group-container"></div>
    </div>
  </main>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
}

.top-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  width: 100%;
}

.group-container {
  display: flex;
  flex-direction: column;
  background-color: var(--gray);
  min-height: 200px;
}
</style>
