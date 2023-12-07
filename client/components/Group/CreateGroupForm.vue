<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";
import ImageUploader from "../ClothingItem/ImageUploader.vue";

const imageContent = ref("");
const name = ref("");
// const description = ref("");
const emit = defineEmits(["refreshGroups"]);

const createGroup = async (name: string) => {
  if (imageContent.value) {
    try {
      await fetchy("/api/groups", "POST", {
        body: { name, imageUrl: imageContent.value },
      });
    } catch (_) {
      return;
    }
    emit("refreshGroups");
    emptyForm();
  }
};

const emptyForm = () => {
  imageContent.value = "";
  name.value = "";
};

const handleImageUpload = (url: string) => {
  imageContent.value = url;
};
</script>

<template>
  <form @submit.prevent="createGroup(name)">
    <label for="name">Group Name:</label>
    <input id="name" placeholder="6.1040 NESJ Group" v-model="name" required />
    <label for="content">Display Image:</label>
    <ImageUploader @uploadImage="handleImageUpload" />
    <button type="submit" class="pure-button-primary pure-button" v-if="imageContent">Create Group</button>
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
