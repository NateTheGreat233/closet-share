<script setup lang="ts">
import ClothingItemComponent from "@/components/ClothingItem/ClothingItemComponent.vue";
import CreateClothingItemForm from "@/components/ClothingItem/CreateClothingItemForm.vue";
import EditClothingItemForm from "@/components/ClothingItem/EditClothingItemForm.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const { isLoggedIn } = storeToRefs(useUserStore());
const props = defineProps(["username", "onCloset"]);
const username = props.username;
const store = ref<Array<Record<string, string>>>([]);
const loaded = ref(false);
let editing = ref("");

async function getStore() {
  let storeData;
  try {
    storeData = await fetchy(`/api/store/${props.username}`, "GET");
    loaded.value = true;
  } catch (_) {
    return;
  }
  store.value = storeData;
}

function updateEditing(id: string) {
  editing.value = id;
}

onBeforeMount(async () => {
  await getStore();
});
</script>

<template>
  <section v-if="isLoggedIn && onCloset">
    <h2>Create a clothing item listing:</h2>
    <CreateClothingItemForm @refreshClothingItems="getStore" />
  </section>
  <section class="clothingItems" v-if="loaded && store.length !== 0">
    <div class="item" v-for="item in store" :key="item._id">
      <div class="container">
        <ClothingItemComponent v-if="editing !== item._id" :clothingItem="item" @refreshClothingItems="getStore" @editClothingItem="updateEditing" />
        <EditClothingItemForm v-else :clothingItem="item" @refreshClothingItems="getStore" @editClothingItem="updateEditing" />
      </div>
    </div>
  </section>
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

.container {
  width: 260px;
}
.clothingItems {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1em;
  margin-top: 20px;
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
</style>
