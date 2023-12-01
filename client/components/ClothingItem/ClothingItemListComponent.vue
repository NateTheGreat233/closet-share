<script setup lang="ts">
import ClothingItemComponent from "@/components/ClothingItem/ClothingItemComponent.vue";
import CreateClothingItemForm from "@/components/ClothingItem/CreateClothingItemForm.vue";
import EditClothingItemForm from "@/components/ClothingItem/EditClothingItemForm.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import SearchClothingItemForm from "./SearchClothingItemForm.vue";

const { isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
let clothingItems = ref<Array<Record<string, string>>>([]);
let editing = ref("");
let searchOwner = ref("");

async function getClothingItems(owner?: string) {
  let query: Record<string, string> = owner !== undefined ? { owner } : {};
  let clothingItemResults;
  try {
    clothingItemResults = await fetchy("/api/clothingItems", "GET", { query });
  } catch (_) {
    return;
  }
  searchOwner.value = owner ? owner : "";
  clothingItems.value = clothingItemResults;
}

function updateEditing(id: string) {
  editing.value = id;
}

onBeforeMount(async () => {
  await getClothingItems();
  loaded.value = true;
});
</script>

<template>
  <section v-if="isLoggedIn">
    <h2>Create a clothing item listing:</h2>
    <CreateClothingItemForm @refreshClothingItems="getClothingItems" />
  </section>
  <div class="row">
    <h2 v-if="!searchOwner">ClothingItems:</h2>
    <h2 v-else>Clothing Items owned by {{ searchOwner }}:</h2>
    <SearchClothingItemForm @getClothingItemsByOwner="getClothingItems" />
  </div>
  <section class="clothingItems" v-if="loaded && clothingItems.length !== 0">
    <article v-for="clothingItem in clothingItems" :key="clothingItem._id">
      <ClothingItemComponent v-if="editing !== clothingItem._id" :clothingItem="clothingItem" @refreshClothingItems="getClothingItems" @editClothingItem="updateEditing" />
      <EditClothingItemForm v-else :clothingItem="clothingItem" @refreshClothingItems="getClothingItems" @editClothingItem="updateEditing" />
    </article>
  </section>
  <p v-else-if="loaded">No clothing items found</p>
  <p v-else>Loading...</p>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

.posts {
  padding: 1em;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}
</style>
