<script setup lang="ts">
import Search from "@/components/Search/Search.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import BorrowedItemComponent from "../components/ClothingItem/BorrowedItemComponent.vue";
import { useBorrowedClothingItemStore, useClothingItemStore } from "../stores/clothingItem";

const { allClothingItems } = storeToRefs(useClothingItemStore());
const { getAllClothingItems } = useClothingItemStore();
const { allBorrowedClothingItems } = storeToRefs(useBorrowedClothingItemStore());
const { getBorrowedClothingItems } = useBorrowedClothingItemStore();
const { currentUsername } = storeToRefs(useUserStore());

const isDataLoaded = ref(false);

// onBeforeMount(async () => {
//   // only if we haven't pre-populated the data, we'll fetch again
//   console.log("Fetching borrowed items...");
//   if (allBorrowedClothingItems.value == undefined) {
//     await getBorrowedClothingItems(currentUsername.value);
//     isDataLoaded.value = true;
//   }
// });
onMounted(async () => {
  console.log("Fetching borrowed items...");
  await getBorrowedClothingItems(currentUsername.value);
});
console.log(currentUsername.value);
console.log(allBorrowedClothingItems.value);
</script>

<template>
  <main>
    <div v-if="allBorrowedClothingItems && allBorrowedClothingItems.length" class="container">
      <Search />
      <div class="top-row">
        <h1>currently borrowing</h1>
        <div class="history-button-container">
          <img src="@/assets/images/book.png" @dragstart="(e) => e.preventDefault()" />
          <h2>HISTORY</h2>
        </div>
      </div>
      <div class="listing-wrapper">
        <!-- <div v-for="item in allBorrowedClothingItems" class="listing-container"> -->
        <div v-for="(item, index) in allBorrowedClothingItems" :key="index" class="listing-container">
          <BorrowedItemComponent :owner="item.owner" :name="item.name" :description="item.description" :imageUrl="item.imageUrl" :clothingItem="item" />
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
