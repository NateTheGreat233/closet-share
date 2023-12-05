<script setup lang="ts">
import { defineProps } from "vue";

const { owner, name, description, imageUrl } = defineProps({
  owner: String,
  name: String,
  description: String,
  imageUrl: String,
});

const onReturnClick = () => {};

const onContactOwnerClick = () => {};

const onViewContractClick = () => {};
</script>

<template>
  <main>
    <div class="container">
      <div class="image-container">
        <img :src="imageUrl" />
      </div>
      <div class="description-container">
        <div class="info-column">
          <h2>{{ name?.toUpperCase() }}</h2>
          <div class="info-descriptions">
            <h2>owner: @{{ owner }}</h2>
            <h2>date borrowed: TODO</h2>
            <h2>return date: TODO</h2>
            <h2>notes: {{ description }}</h2>
          </div>
        </div>
        <div class="actions-column">
          <div class="button-container">
            <h2 class="button-text">I have returned this item</h2>
          </div>
          <div class="button-container">
            <h2 class="button-text">contact owner</h2>
          </div>
          <div class="button-container">
            <h2 class="button-text">view contract details</h2>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: row;
  gap: 40px;
  width: 100%;
}

.button-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--gray);
  padding: 10px;
  border-radius: 15px;
  min-width: 300px;
}

.button-container:hover {
  cursor: pointer;
  background-color: var(--gray-hover);
}

.button-text {
  user-select: none;
}

h2 {
  margin: 0px;
}

img {
  object-fit: contain;
  height: 100%;
  width: 100%;
}

.actions-column {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 20px;
}

.info-column {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.info-descriptions {
  display: flex;
  gap: 10px;
  flex-direction: column;
}

.description-container {
  display: flex;
  flex-grow: 2;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  background-color: var(--light-gray);
  padding: 20px;
}

.image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--light-gray);
  padding: 10px;
  width: 300px;
  height: 250px;
}
</style>
