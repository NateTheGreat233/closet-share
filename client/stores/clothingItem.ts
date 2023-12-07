import { defineStore } from "pinia";
import { ref } from "vue";
import { fetchy } from "../utils/fetchy";

type ClothingItem = {
  owner: string;
  name: string;
  description: string;
  imageUrl: string;
};

export const useClothingItemStore = defineStore(
  "clothingItem",
  () => {
    const allClothingItems = ref<Array<ClothingItem>>();

    const getAllClothingItems = async () => {
      try {
        allClothingItems.value = await fetchy("/api/clothingItems", "GET");
      } catch (_) {}
    };

    const onSignIn = async () => {
      await getAllClothingItems();
    };

    const resetStore = () => {
      allClothingItems.value = undefined;
    };

    return {
      allClothingItems,
      getAllClothingItems,
      onSignIn,
      resetStore,
    };
  },
  { persist: true },
);

export const useBorrowedClothingItemStore = defineStore(
  "borrowedClothingItem",
  () => {
    const allBorrowedClothingItems = ref<Array<ClothingItem>>();

    const getBorrowedClothingItems = async (borrower: string) => {
      try {
        const response = await fetchy(`/api/borrowedItems/${borrower}`, "GET");
        console.log(response);
        // allBorrowedClothingItems.value = response;
        // console.log(allBorrowedClothingItems);
        return response;
      } catch (_) {}
    };

    const onSignIn = async (borrower: string) => {
      await getBorrowedClothingItems(borrower);
    };

    const resetStore = () => {
      allBorrowedClothingItems.value = undefined;
    };

    return {
      allBorrowedClothingItems,
      getBorrowedClothingItems,
      onSignIn,
      resetStore,
    };
  },
  { persist: true },
);
