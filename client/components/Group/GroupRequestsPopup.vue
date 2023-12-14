<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref } from "vue";
import { useGroupStore } from "../../stores/group";
import { fetchy } from "../../utils/fetchy";

const emit = defineEmits(["onClose"]);

const { myGroupRequests, allGroups } = storeToRefs(useGroupStore());
const { groupStoreStartup } = useGroupStore();
const allUsers = ref<any>();

const requestInfo = computed(() => {
  const pendingGroupRequests = (myGroupRequests.value ?? []).filter((myGroupRequests) => myGroupRequests.status === "pending");
  let out = [];
  for (const groupRequest of pendingGroupRequests) {
    const correspondingGroup = (allGroups.value ?? []).filter((group) => groupRequest.groupId === group._id)[0];
    const username = allUsers.value.filter((user: any) => user._id === groupRequest.user)[0].username;
    out.push({ ...correspondingGroup, user: groupRequest.user, username });
  }
  return out;
});

const { visible } = defineProps({
  visible: Boolean,
});

const onApprove = async (userId: string, groupId: string) => {
  // console.log(userId, groupId);
  await fetchy(`/api/group/accept`, "PUT", {
    body: { userId, groupId },
  });
  await groupStoreStartup();
};

onBeforeMount(async () => {
  allUsers.value = await fetchy(`/api/users`, "GET");
});
</script>

<template>
  <div v-if="visible" class="modal-container" @click="() => emit('onClose')">
    <div class="modal-content" @click="(e) => e.stopPropagation()">
      <h1>my group approvals</h1>
      <h3>Here you can accept requests from users who want to join groups you are in.</h3>
      <div v-for="request in requestInfo" style="width: 100%; overflow-y: scroll">
        <div class="request-container">
          <div style="display: flex; flex-direction: row; align-items: center; gap: 20px">
            <img :src="request.imageUrl" @dragstart="(e) => e.preventDefault()" />
            <div>
              <h2>{{ request.name }}</h2>
              <h2>{{ request.username }}</h2>
            </div>
          </div>
          <div class="button-container" @click="() => onApprove(request.user, request._id)">
            <h2 class="button-text">approve</h2>
          </div>
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

h2 {
  margin: 0px;
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
