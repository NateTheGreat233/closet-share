<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";
import { formatDate } from "../../utils/formatDate";

const props = defineProps(["clothingItem"]);
const description = ref(props.clothingItem.description);
const emit = defineEmits(["editClothingItem", "refreshClothingItems"]);

const editClothingItem = async (description: string) => {
  try {
    await fetchy(`/api/clothingItems/${props.clothingItem._id}`, "PATCH", { body: { update: { description: description } } });
  } catch (e) {
    return;
  }
  emit("editClothingItem");
  emit("refreshClothingItems");
};
</script>

<template>
  <form @submit.prevent="editClothingItem(description)">
    <p class="owner">{{ props.clothingItem.owner }}</p>
    <textarea id="description" v-model="description" placeholder="Size, brand, etc." required> </textarea>
    <div class="base">
      <menu>
        <li><button class="btn-small pure-button-primary pure-button" type="submit">Save</button></li>
        <li><button class="btn-small pure-button" @click="emit('editClothingItem')">Cancel</button></li>
      </menu>
      <p v-if="props.clothingItem.dateCreated !== props.clothingItem.dateUpdated" class="timestamp">Edited on: {{ formatDate(props.clothingItem.dateUpdated) }}</p>
      <p v-else class="timestamp">Created on: {{ formatDate(props.clothingItem.dateCreated) }}</p>
    </div>
  </form>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 6em;
  border-radius: 4px;
  resize: none;
}

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

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
}
</style>
