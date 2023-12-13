<script setup lang="ts">
import { ref } from "vue";
import { useGroupStore } from "../../stores/group";
import { fetchy } from "../../utils/fetchy";
import ImageUploader from "../ClothingItem/ImageUploader.vue";

const imageContent = ref("");
const name = ref("");
const emit = defineEmits(["onClose"]);
const { getAllGroups, getMyRequests } = useGroupStore();

const { visible } = defineProps({
  visible: Boolean,
});

const refresh = async () => {
  await getAllGroups();
  await getMyRequests();
};

const createGroup = async () => {
  if (imageContent.value) {
    try {
      await fetchy("/api/groups", "POST", {
        body: { name: name.value, imageUrl: imageContent.value },
      });
    } catch (_) {
      return;
    }
    await refresh();
    emit("onClose");
  }
};

const handleImageUpload = (url: string) => {
  imageContent.value = url;
};
</script>

<template>
  <div v-if="visible" class="modal-container" @click="() => emit('onClose')">
    <div class="modal-content" @click="(e) => e.stopPropagation()">
      <div>
        <h1 class="title">create new group</h1>
        <div class="input-row">
          <h2>group name</h2>
          <input placeholder="your group name" v-model="name" />
        </div>
        <div class="input-row">
          <h2>display image</h2>
          <ImageUploader @uploadImage="handleImageUpload" />
        </div>
      </div>
      <div class="button-container" @click="createGroup" :class="{ 'button-container-disabled': name.length === 0 || !imageContent }">
        <h2 class="button-text">create group</h2>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-container {
  display: flex;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.482);
  align-items: center;
  justify-content: center;
}

.title {
  text-align: center;
}

.button-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--gray);
  padding: 10px;
  padding-left: 20px;
  padding-right: 20px;
  border-radius: 10px;
}

.button-container:hover {
  background-color: var(--gray-hover);
  cursor: pointer;
}

.button-container-disabled {
  background-color: var(--disabled);
}

.button-container-disabled:hover {
  background-color: var(--disabled);
  cursor: default;
}

h2 {
  margin: 0px;
}

.input-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  align-self: flex-start;
  gap: 20px;
}

input {
  border-radius: 5px;
  border-width: 0px;
  padding-left: 15px;
  padding-right: 15px;
  padding-top: 10px;
  padding-bottom: 10px;
  background-color: var(--light-gray);
  width: 200px;
  height: 20px;
}

input:focus {
  outline: none;
}

.modal-content {
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 10px;
  gap: 20px;
  width: 800px;
  height: 80%;
  box-sizing: border-box;
  padding: 10px;
  padding-left: 100px;
  padding-right: 100px;
  justify-content: space-between;
  padding-bottom: 40px;
}

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
