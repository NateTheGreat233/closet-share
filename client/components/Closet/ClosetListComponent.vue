<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["username"]);
const username = props.username;
const store = ref<Array<Record<string, string>>>([]);
const loaded = ref(false);

async function getStore(username: string) {
  let storeData;
  try {
    storeData = await fetchy(`/api/store/${username}`, "GET");
    loaded.value = true;
  } catch (_) {
    return;
  }
  store.value = storeData;
}

onBeforeMount(async () => {
  await getStore(username);
});
</script>

<template>
  <h2>Store Items:</h2>
  <section class="clothingItems" v-if="loaded && store.length !== 0">
    <article v-for="clothingItem in store" :key="clothingItem._id">
      {{ clothingItem }}
    </article>
  </section>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: row;
  gap: 40px;
  width: 100%;
}

.button-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--gray);
  padding: 10px;
  border-radius: 15px;
  min-width: 300px;
}

.button-container:hover {
  cursor: pointer;
  background-color: var(--gray-hover);
}

.button-text {
  user-select: none;
}

h2 {
  margin: 0px;
}

img {
  object-fit: contain;
  height: 100%;
  width: 100%;
}

.actions-column {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 20px;
}

.info-column {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.info-descriptions {
  display: flex;
  gap: 10px;
  flex-direction: column;
}

.description-container {
  display: flex;
  flex-grow: 2;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  background-color: var(--light-gray);
  padding: 20px;
}

.image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--light-gray);
  padding: 10px;
  width: 300px;
  height: 250px;
}
</style>
