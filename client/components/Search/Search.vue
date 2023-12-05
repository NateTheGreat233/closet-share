<script setup lang="ts"></script>

<template>
  <div class="search-bar">
    <img src="@/assets/images/search.png" class="search-icon" @dragstart="(e) => e.preventDefault()" />
    <input type="text" placeholder="search borrowed items" />
  </div>
</template>

<style scoped>
.search-bar {
  display: flex;
  flex-direction: row;
  gap: 5px;
}

.search-icon {
  padding: 5px;
  width: 30px;
  border-radius: 10px;
}

.search-icon:hover {
  cursor: pointer;
  background-color: var(--light-gray);
}

input {
  border-radius: 10px;
  border-width: 0px;
  padding-left: 15px;
  padding-right: 15px;
  background-color: var(--light-gray);
  width: 400px;
}

input:focus {
  outline: none;
}
</style>
