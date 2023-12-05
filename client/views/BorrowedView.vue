<script setup lang="ts">
import Search from "@/components/Search/Search.vue";
import { onBeforeMount, ref } from "vue";
import BorrowedItemComponent from "../components/ClothingItem/BorrowedItemComponent.vue";
import { fetchy } from "../utils/fetchy";

const loaded = ref(false);
let clothingItems = ref<Array<Record<string, string>>>([]);
let searchOwner = ref("");

const getClothingItems = async (owner?: string) => {
  let query: Record<string, string> = owner !== undefined ? { owner } : {};
  let clothingItemResults;
  try {
    clothingItemResults = await fetchy("/api/clothingItems", "GET", { query });
  } catch (_) {
    return;
  }
  searchOwner.value = owner ? owner : "";
  clothingItems.value = clothingItemResults;
};

onBeforeMount(async () => {
  await getClothingItems();
  loaded.value = true;
});
</script>

<template>
  <main>
    <div class="container">
      <Search />
      <div class="top-row">
        <h1>currently borrowing</h1>
        <div class="history-button-container">
          <img src="@/assets/images/book.png" />
          <h2>HISTORY</h2>
        </div>
      </div>
      <div class="listing-wrapper">
        <div v-for="item in clothingItems" class="listing-container">
          <BorrowedItemComponent :owner="item.owner" :name="item.name" :description="item.description" :imageUrl="item.imageUrl" />
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding-left: 100px;
  padding-right: 100px;
}

.history-button-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 10px;
  padding-left: 20px;
  padding-right: 20px;
  height: 30px;
  background-color: var(--gray);
  border-radius: 15px;
}

.history-button-container:hover {
  cursor: pointer;
  background-color: var(--gray-hover);
}

img {
  height: 20px;
}

.listing-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.listing-wrapper {
  gap: 40px;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.top-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  user-select: none;
}
</style>
