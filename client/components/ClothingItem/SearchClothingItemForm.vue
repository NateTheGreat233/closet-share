<script setup lang="ts">
import { ref } from "vue";

const owner = ref("");
const emit = defineEmits(["getClothingItemsByOwner"]);
</script>

<template>
  <form @submit.prevent="emit('getClothingItemsByOwner', owner)" class="pure-form">
    <fieldset>
      <legend>Search by Owner</legend>
      <input id="owner" type="text" v-model="owner" placeholder="Username" />
      <button type="submit" class="pure-button pure-button-primary">Search</button>
    </fieldset>
  </form>
</template>

<style scoped>
form {
  display: flex;
  gap: 0.5em;
  padding: 1em;
  align-items: center;
}
</style>
