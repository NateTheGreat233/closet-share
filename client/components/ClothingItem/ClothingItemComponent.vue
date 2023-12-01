<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { defineEmits, defineProps } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["clothingItem"]);
const emit = defineEmits(["editClothingItem", "refreshClothingItems"]);
const { currentUsername } = storeToRefs(useUserStore());

const deleteClothingItem = async () => {
  try {
    await fetchy(`/api/clothingItems/${props.clothingItem._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshClothingItems");
};

console.log(props.clothingItem);
console.log(props.clothingItem.owner);
console.log(props.clothingItem.name);
console.log(props.clothingItem.description);
console.log(props.clothingItem.imageUrl);
</script>

<template>
  <p class="author">{{ props.clothingItem.owner }}</p>
  <p class="name">{{ props.clothingItem.name }}</p>
  <p class="description">{{ props.clothingItem.description }}</p>
  <img :src="props.clothingItem.imageUrl" alt="photo" />
  <div class="base">
    <menu v-if="props.clothingItem.owner == currentUsername">
      <li><button class="btn-small pure-button" @click="emit('editClothingItem', props.clothingItem._id)">Edit</button></li>
      <li><button class="button-error btn-small pure-button" @click="deleteClothingItem">Delete</button></li>
    </menu>
    <article class="timestamp">
      <p v-if="props.clothingItem.dateCreated !== props.clothingItem.dateUpdated">Edited on: {{ formatDate(props.clothingItem.dateUpdated) }}</p>
      <p v-else>Created on: {{ formatDate(props.clothingItem.dateCreated) }}</p>
    </article>
  </div>
</template>

<style scoped>
p {
  margin: 0em;
}

.author {
  font-weight: bold;
  font-size: 1.2em;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
}

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.base article:only-child {
  margin-left: auto;
}
</style>
