<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { defineEmits, defineProps, ref } from "vue";
import { fetchy } from "../../utils/fetchy";
import CreateContractPopup from "../Contract/CreateContractPopup.vue";

const props = defineProps(["clothingItem"]);
const emit = defineEmits(["editClothingItem", "refreshClothingItems"]);
const { currentUsername } = storeToRefs(useUserStore());
const showContractPopup = ref<boolean>(false);

const deleteClothingItem = async () => {
  try {
    await fetchy(`/api/clothingItems/${props.clothingItem._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshClothingItems");
  window.location.reload();
};

const onClickBorrow = async () => {
  showContractPopup.value = true;
};

const onBorrow = async ({ borrowDate, returnDate }: { borrowDate: Date; returnDate: Date }) => {
  try {
    await fetchy(`/api/borrow/clothingItems/${props.clothingItem._id}`, "PATCH", {});
    const { contract } = await fetchy(`/api/contracts`, "POST", {
      body: {
        item: props.clothingItem._id,
        borrowDate,
        returnDate,
      },
    });
    await fetchy(`/api/contracts/finalize/${contract._id}`, "PATCH");
  } catch (e) {
    console.error("Error:", e);
    return;
  }
  emit("refreshClothingItems");
};

console.log(props.clothingItem);
console.log(props.clothingItem.owner);
console.log(props.clothingItem.name);
console.log(props.clothingItem.description);
console.log(props.clothingItem.imageUrl);

console.log("username is " + currentUsername.value);
</script>

<template>
  <p class="author">{{ props.clothingItem.owner }}</p>
  <p class="name">{{ props.clothingItem.name }}</p>
  <p class="description">{{ props.clothingItem.description }}</p>
  <menu v-if="props.clothingItem.owner !== currentUsername">
    <li><button class="btn-small pure-button brown" @click="onClickBorrow">Borrow</button></li>
    <!-- <li><button class="btn-small pure-button green" @click="deleteClothingItem">Return</button></li> -->
  </menu>
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
  <CreateContractPopup
    @onClose="() => (showContractPopup = false)"
    @onBorrow="onBorrow"
    :visible="showContractPopup"
    :imageUrl="props.clothingItem.imageUrl"
    :title="props.clothingItem.name"
    :owner="props.clothingItem.owner"
    :notes="props.clothingItem.description"
  />
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

img {
  max-width: 100%; /* Ensure the image doesn't exceed its container */
  height: auto; /* Maintain aspect ratio */
  border: 1px solid #ccc; /* Optional border for images */
}

.brown {
  background-color: #735751; /* Brown color for Borrow button */
  color: white; /* Text color for Borrow button */
}

.green {
  background-color: #a5a58d; /* Green color for Return button */
  color: white; /* Text color for Return button */
}
</style>
