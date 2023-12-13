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
    <template v-for="(group, index) in Math.ceil(store.length / 3)" :key="index">
      <div class="row">
        <template v-for="clothingItem in store.slice(index * 3, index * 3 + 3)" :key="clothingItem._id">
          <article>
            <ClothingItemComponent v-if="editing !== clothingItem._id" :clothingItem="clothingItem" @refreshClothingItems="getStore" @editClothingItem="updateEditing" />
            <EditClothingItemForm v-else :clothingItem="clothingItem" @refreshClothingItems="getStore" @editClothingItem="updateEditing" />
          </article>
        </template>
      </div>
    </template>
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
.clothingItems {
  margin-top: 50px;
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
</style>
