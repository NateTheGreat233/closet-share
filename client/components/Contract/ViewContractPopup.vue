<script setup lang="ts">
import { defineProps } from "vue";

const { visible, borrowDate, returnDate } = defineProps({
  visible: Boolean,
  borrowDate: String,
  returnDate: String,
});

const emit = defineEmits(["onClose"]);
</script>

<template>
  <div v-if="visible" class="modal-container" @click="() => emit('onClose')">
    <div class="modal-content" @click="(e) => e.stopPropagation()">
      <h1>contract</h1>
      <h2 v-if="borrowDate">borrow date: {{ new Date(borrowDate).toDateString() }}</h2>
      <h2 v-if="returnDate">return date: {{ new Date(returnDate).toDateString() }}</h2>
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

h2 {
  margin: 0px;
}

.modal-content {
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 10px;
  gap: 20px;
  width: 500px;
  height: 300px;
  box-sizing: border-box;
  padding: 10px;
}
</style>
