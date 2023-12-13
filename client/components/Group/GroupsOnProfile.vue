<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { useGroupStore } from "../../stores/group";
import { fetchy } from "../../utils/fetchy";

const groups = ref<Array<Record<string, string>>>([]);
const loaded = ref(false);
const { currentUserId } = storeToRefs(useUserStore());
const { getAllGroups, getMyGroups } = useGroupStore();

async function getGroupsOfUser() {
  let groupsData;
  try {
    groupsData = await fetchy(`/api/groups/user/${currentUserId.value}`, "GET");
    loaded.value = true;
  } catch (_) {
    return;
  }
  groups.value = groupsData;
}
const refresh = async () => {
  await getAllGroups();
  await getMyGroups();
};

async function leaveGroup(groupId: string) {
  try {
    await fetchy(`/api/group/${groupId}/user/${currentUserId.value}`, "DELETE");
    await getGroupsOfUser();
    await refresh();
  } catch (_) {
    return;
  }
}

onBeforeMount(async () => {
  await getGroupsOfUser();
});
</script>

<template>
  <main>
    <div class="container">
      <div class="top-row">
        <h1>my groups</h1>
        <!-- <Search :inputWidth="'200px'" /> -->
      </div>
      <section class="groups" v-if="loaded && groups.length !== 0">
        <div v-for="group in groups" class="groups-container" v-bind:key="group.name">
          <div class="group-container">
            <img :src="group.imageUrl" alt="photo" />
            <div class="groupInfo">
              <h1 class="name">{{ group.name }}</h1>
              <div class="actions">
                <button class="btn-big pure-button brown" @click="() => leaveGroup(group._id)">Leave</button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="groups-container" v-else>
        <h2>This user is not in any groups currently</h2>
      </section>
    </div>
  </main>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
}

img {
  width: 50%; /* Default */
  max-width: 200px;
  height: auto; /* Maintain aspect ratio */
  border: 1px solid #ccc; /* Optional border for images */
  border-radius: 100em;
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
  margin-bottom: 20px;
  padding-inline: 50px;
  border-radius: 20px;
  box-sizing: border-box;
}

.no-groups {
  text-align: center;
}

.top-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  width: 100%;
}

button {
  margin: 10px;
}

.brown {
  background-color: #735751; /* Brown color for Leave button */
  color: white; /* Text color for Borrow button */
}
.red {
  background-color: rgb(182, 40, 18); /* Green color for Return button */
  color: white; /* Text color for Return button */
}

.groups-container {
  display: flex;
  flex-direction: column;
  background-color: var(--gray);
  padding-top: 20px;
  padding-left: 20px;
  padding-right: 20px;
}
</style>
