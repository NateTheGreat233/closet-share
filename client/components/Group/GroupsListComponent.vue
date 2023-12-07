<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";
import CreateGroupForm from "./CreateGroupForm.vue";
import GroupComponent from "./GroupComponent.vue";

const loaded = ref(false);
const groups = ref<Array<Record<string, string>>>([]);
const users = ref<Record<string, string>>({});

async function getAllGroups(name?: string) {
  let groupData;
  try {
    groupData = await fetchy(`/api/groups${name ?? ""}`, "GET");
  } catch (_) {
    return;
  }
  groups.value = groupData;
}

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
  await getAllGroups();
  await getAllUsers();
  loaded.value = true;
});
</script>

<template>
  <main>
    <div class="container">
      <CreateGroupForm @refreshGroups="getAllGroups" />
    </div>
    <div class="container">
      <div class="top-row">
        <h1>all groups</h1>
        <Search :inputWidth="'200px'" />
      </div>
      <section class="groups" v-if="loaded && groups.length !== 0">
        <div v-for="group in groups" class="groups-container" v-bind:key="group.name">
          <div class="group-container">
            <GroupComponent :group="group" :allUsers="users" @refreshGroups="getAllGroups" />
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  margin: 50px;
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
  padding: 10px;
  background-color: var(--light-gray);
  margin: 20px;
  border-radius: 20px;
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
  background-color: var(--gray);
  padding-top: 20px;
  padding-left: 20px;
  padding-right: 20px;
  margin-left: 200px;
  margin-right: 200px;
}
</style>
