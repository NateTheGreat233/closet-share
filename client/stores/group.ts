import { defineStore } from "pinia";
import { ref } from "vue";

export const useGroupStore = defineStore(
  "group",
  () => {
    const groupNames = ref<Array<string>>();

    const getGroups = async () => {};

    const resetStore = () => {
      groupNames.value = undefined;
    };

    return {
      groupNames,
      getGroups,
      resetStore,
    };
  },
  { persist: true },
);
