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
  {{ store }}
</template>

<style></style>
