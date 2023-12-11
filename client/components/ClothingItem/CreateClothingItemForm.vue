<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";
import ImageUploader from "./ImageUploader.vue";

const imageContent = ref("");
const name = ref("");
const description = ref("");
const emit = defineEmits(["refreshClothingItems"]);

const createClothingItem = async (name: string, description: string) => {
  if (imageContent.value) {
    try {
      await fetchy("/api/clothingItems", "POST", {
        body: { name: name, description: description, imageUrl: imageContent.value },
      });
    } catch (_) {
      return;
    }

    emit("refreshClothingItems");
    emptyForm();
  }
};

const emptyForm = () => {
  imageContent.value = "";
  name.value = "";
  description.value = "";
};

const handleImageUpload = (url: string) => {
  imageContent.value = url;
};
</script>

<template>
  <form @submit.prevent="createClothingItem(name, description)">
    <label for="name">Name of clothing item:</label>
    <textarea id="name" placeholder="Black dress" v-model="name" required> </textarea>
    <label for="description">Description of clothing item:</label>
    <textarea id="description" placeholder="Size, brand, etc." v-model="description" required> </textarea>
    <label for="content">Image of clothing item:</label>
    <ImageUploader @uploadImage="handleImageUpload" />
    <button type="submit" class="pure-button-primary pure-button" v-if="imageContent">Create Clothing Item</button>
  </form>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 6em;
  padding: 0.5em;
  border-radius: 4px;
  resize: none;
}
</style>
