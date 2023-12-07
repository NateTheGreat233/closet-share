<script setup lang="ts">
import { defineProps, ref, watchEffect } from "vue";

const { visible, imageUrl, title, owner, notes } = defineProps({
  visible: Boolean,
  imageUrl: String,
  title: String,
  owner: String,
  notes: String,
});

const emit = defineEmits(["onClose", "onBorrow"]);

const borrowDate = ref<string>();
const returnDate = ref<string>();

const minBorrowDate = ref<string>(new Date().toISOString().split("T")[0]);
const maxBorrowDate = ref<string>();
const minReturnDate = ref<string>(new Date().toISOString().split("T")[0]);

watchEffect(() => {
  if (returnDate.value) {
    console.log(new Date(returnDate.value).toISOString().split("T")[0]);
  }
  maxBorrowDate.value = returnDate.value ? new Date(returnDate.value).toISOString().split("T")[0] : undefined;
  minReturnDate.value = (borrowDate.value ? new Date(borrowDate.value) : new Date()).toISOString().split("T")[0];
});

const onBorrow = () => {
  if (borrowDate.value && returnDate.value) {
    emit("onClose");
    emit("onBorrow", { borrowDate: new Date(borrowDate.value), returnDate: new Date(returnDate.value) });
  }
};
</script>

<template>
  <div v-if="visible" class="modal-container" @click="() => emit('onClose')">
    <div class="modal-content" @click="(e) => e.stopPropagation()">
      <div class="left-container">
        <img :src="imageUrl" class="clothing-image" @dragstart="(e) => e.preventDefault()" />
      </div>
      <div class="right-container">
        <div class="details-container">
          <h1>{{ title?.toUpperCase() }}</h1>
          <h2>@{{ owner }}</h2>
          <div class="description-container">
            <h2>owner notes</h2>
            <h3>{{ notes }}</h3>
          </div>
          <div class="bottom-container">
            <div class="date-container">
              <div class="date-row">
                <h3 style="width: 100px">pick up date</h3>
                <input type="date" :min="minBorrowDate" :max="maxBorrowDate" v-model="borrowDate" />
              </div>
              <div class="date-row">
                <h3 style="width: 100px">return date</h3>
                <input type="date" :min="minReturnDate" v-model="returnDate" />
              </div>
            </div>
            <div class="button-container" @click="onBorrow">
              <h2 class="button-text">borrow</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.left-container {
  display: flex;
  width: 47%;
  height: 100%;
}

.date-row {
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 20px;
}

.date-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.bottom-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: var(--russet);
  flex-grow: 1;
  padding: 20px;
  gap: 20px;
}

.description-container {
  display: flex;
  flex-direction: column;
  background-color: var(--russet);
  flex-grow: 1;
  padding: 20px;
  gap: 20px;
}

h1,
h2,
h3 {
  margin: 0px;
  padding: 0px;
}

.details-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-grow: 1;
}

.button-text {
  user-select: none;
}

.button-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background-color: var(--gray);
  border-radius: 10px;
}

.button-container:hover {
  cursor: pointer;
  background-color: var(--gray-hover);
}

.right-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-top: 20px;
  padding-bottom: 20px;
  box-sizing: border-box;
  width: 47%;
  height: 100%;
  gap: 20px;
}

.clothing-image {
  object-fit: contain;
  width: 100%;
  height: 100%;
}

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

.modal-content {
  background-color: white;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-radius: 10px;
  width: 80%;
  height: 80%;
  box-sizing: border-box;
  padding: 10px;
}
</style>
