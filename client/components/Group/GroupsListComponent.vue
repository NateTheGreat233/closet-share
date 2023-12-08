<script setup lang="ts">
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { useGroupStore } from "../../stores/group";
import { fetchy } from "../../utils/fetchy";
import GroupComponent from "./GroupComponent.vue";

const loaded = ref(false);
const users = ref<Record<string, string>>({});

const { allGroups } = storeToRefs(useGroupStore());
const { getAllGroups, getMyRequests } = useGroupStore();

async function getAllUsers() {
  let userData;
  try {
    userData = await fetchy(`/api/users`, "GET");
  } catch (_) {
    return;
  }
  userData.forEach((user: Record<string, string>) => {
    if (user._id) users.value[user._id] = user.username;
  });
}

onBeforeMount(async () => {
  // await getAllGroups();
  await getAllUsers();
  loaded.value = true;
});

const refresh = async () => {
  getAllGroups();
  getMyRequests();
};
</script>

<template>
  <main>
    <div class="container">
      <div v-if="loaded && allGroups && allGroups.length !== 0" v-for="group in allGroups" class="groups-container" v-bind:key="group.name">
        <div class="group-container">
          <GroupComponent :group="group" :allUsers="users" @refreshGroups="refresh" />
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.group-picture {
  width: 50px;
  height: 50px;
  background-color: white;
  padding: 10px;
  border-radius: 50%;
}

.group-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: 20px;
  padding: 20px;
  background-color: var(--light-gray);
  border-radius: 20px;
  margin-bottom: 20px;
  box-sizing: border-box;
}

.top-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  width: 100%;
}

.groups-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>
