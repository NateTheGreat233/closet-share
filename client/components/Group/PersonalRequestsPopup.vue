<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { useGroupStore } from "../../stores/group";

const emit = defineEmits(["refreshGroups", "onClose"]);

const { myRequests, allGroups } = storeToRefs(useGroupStore());
const requestInfo = computed(() => {
  const myPendingIds = (myRequests.value ?? []).filter((request) => request.status === "pending").map((request) => request.groupId);
  return (allGroups.value ?? []).filter((group) => myPendingIds.includes(group._id));
});

const { visible } = defineProps({
  visible: Boolean,
});
</script>

<template>
  <div v-if="visible" class="modal-container" @click="() => emit('onClose')">
    <div class="modal-content" @click="(e) => e.stopPropagation()">
      <h1>requested groups</h1>
      <h3>Here you'll find all pending requests for groups you've requested to join.</h3>
      <div v-for="request in requestInfo" style="width: 100%; overflow-y: scroll">
        <div class="request-container">
          <div style="display: flex; flex-direction: row; align-items: center; gap: 20px">
            <img :src="request.imageUrl" @dragstart="(e) => e.preventDefault()" />
            <h2>{{ request.name }}</h2>
          </div>
          <h2>request pending</h2>
        </div>
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

img {
  border-radius: 50%;
  width: 75px;
  height: 75px;
  object-fit: cover;
}

.request-container {
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background-color: var(--beige);
  padding: 20px;
  padding-right: 40px;
  border-radius: 5px;
  box-sizing: border-box;
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
  padding-left: 50px;
  padding-right: 50px;
  padding-bottom: 40px;
}
</style>
