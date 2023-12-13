<script setup lang="ts">
import ClothingItemComponent from "@/components/ClothingItem/ClothingItemComponent.vue";
import EditClothingItemForm from "@/components/ClothingItem/EditClothingItemForm.vue";
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";
import router from "../../router";
import { useGroupStore } from "../../stores/group";
import SearchClothingItemForm from "./SearchClothingItemForm.vue";

const { myGroups, getMyGroups } = useGroupStore();

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
    <template v-for="(group, index) in Math.ceil(clothingItems.length / 3)" :key="index">
      <div class="row">
        <template v-for="clothingItem in clothingItems.slice(index * 3, index * 3 + 3)" :key="clothingItem._id">
          <article>
            <ClothingItemComponent v-if="editing !== clothingItem._id" :clothingItem="clothingItem" @refreshClothingItems="getClothingItems" @editClothingItem="updateEditing" />
            <EditClothingItemForm v-else :clothingItem="clothingItem" @refreshClothingItems="getClothingItems" @editClothingItem="updateEditing" />
          </article>
        </template>
      </div>
    </template>
  </section>
  <div v-if="loaded && myGroups?.length == 0">
    <center>
      <h2>You are currently not in any groups</h2>
      <div class="button-container" @click="goToGroups">
        <h2 class="button-text">click here to join a group and view member's clothing items</h2>
      </div>
    </center>
  </div>
  <div v-else-if="loaded"><p>No clothing items found</p></div>
  <center v-else><h2>Loading...</h2></center>
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
  flex-basis: calc(33.33% - 20px);
  box-sizing: border-box;
  border-right: 1px solid #ccc;
  padding-right: 20px;
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
