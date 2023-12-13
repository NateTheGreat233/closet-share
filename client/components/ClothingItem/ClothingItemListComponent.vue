<script setup lang="ts">
import ClothingItemComponent from "@/components/ClothingItem/ClothingItemComponent.vue";
import EditClothingItemForm from "@/components/ClothingItem/EditClothingItemForm.vue";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import router from "../../router";
import { useGroupStore } from "../../stores/group";
import SearchClothingItemForm from "./SearchClothingItemForm.vue";

const { getMyGroups } = useGroupStore();
const { myGroups } = storeToRefs(useGroupStore());

const loaded = ref(false);
let clothingItems = ref<Array<Record<string, string>>>([]);
let editing = ref("");
let searchOwner = ref("");

const goToGroups = async () => {
  await router.push({ name: "Groups" });
};

// Should get all unborrowed clothing items that don't belong to the user
async function getClothingItems(owner?: string) {
  let query: Record<string, string> = owner !== undefined ? { owner } : {};
  let clothingItemResults;
  try {
    clothingItemResults = await fetchy("/api/clothingItems", "GET", { query });
    // console.log(clothingItemResults);
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
  await getMyGroups();
  await getClothingItems();
  loaded.value = true;
});

// console.log(clothingItems);
</script>

<template>
  <!-- <section v-if="isLoggedIn">
    <h2>Create a clothing item listing:</h2>
    <CreateClothingItemForm @refreshClothingItems="getClothingItems" />
  </section> -->
  <div class="row">
    <h2 v-if="!searchOwner">Available clothing items:</h2>
    <h2 v-else>Clothing Items owned by {{ searchOwner }}:</h2>
    <SearchClothingItemForm @getClothingItemsByOwner="getClothingItems" />
  </div>
  <section class="clothingItems" v-if="loaded && clothingItems.length !== 0">
    <div class="item" v-for="item in clothingItems" :key="item._id">
      <div class="container">
        <ClothingItemComponent v-if="editing !== item._id" :clothingItem="item" @refreshClothingItems="getClothingItems" @editClothingItem="updateEditing" />
        <EditClothingItemForm v-else :clothingItem="item" @refreshClothingItems="getClothingItems" @editClothingItem="updateEditing" />
      </div>
    </div>
  </section>
  <div v-else-if="loaded && clothingItems.length == 0"><p>No clothing items found</p></div>
  <center v-else><h2>Loading...</h2></center>
  <div v-if="loaded && myGroups?.length == 0">
    <center>
      <h2>You are currently not in any groups</h2>
      <div class="button-container" @click="goToGroups">
        <h2 class="button-text">click here to join a group and view member's clothing items</h2>
      </div>
    </center>
  </div>
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
  max-width: 80em;
}
.container {
  width: 300px;
}
.clothingItems {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1em;
}

.item {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
  margin: 5px;
}

.posts {
  padding: 1em;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
  margin-bottom: 20px;
}

.button-text {
  margin: 0px;
}

.button-container {
  padding: 10px;
  padding-inline: 50px;
  background-color: var(--gray);
  border-radius: 10px;
  width: 800px;
}

.button-container:hover {
  background-color: var(--gray-hover);
  cursor: pointer;
}
</style>
