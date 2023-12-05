<script setup lang="ts">
import Search from "../Search/Search.vue";

const reviews = ["Review1", "Review2", "Review3"];
</script>

<template>
  <main>
    <div class="container">
      <div class="top-row">
        <h1>my reviews</h1>
        <Search :inputWidth="'200px'" />
      </div>
      <div v-for="review in reviews" class="groups-container">
        <div class="group-container">
          <img src="@/assets/images/logo.png" class="group-picture" @dragstart="(e) => e.preventDefault()" />
          <h2>{{ review }}</h2>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
}

.group-picture {
  width: 50px;
  height: 50px;
  background-color: white;
  padding: 10px;
  border-radius: 50%;
}

.group-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: 20px;
  padding: 10px;
  background-color: var(--light-gray);
  margin-bottom: 20px;
  border-radius: 20px;
  box-sizing: border-box;
}

.top-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  width: 100%;
}

.groups-container {
  display: flex;
  flex-direction: column;
  background-color: var(--gray);
  padding-top: 20px;
  padding-left: 20px;
  padding-right: 20px;
}
</style>
