<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { fetchy } from "../../utils/fetchy";

import { ObjectId } from "mongodb";
import { storeToRefs } from "pinia";
import { defineProps, onBeforeMount } from "vue";
import { useGroupStore } from "../../stores/group";

const props = defineProps(["group", "allUsers", "allRequests"]);
const users: Array<string> = props.group.members.map((id: string) => props.allUsers[id]);
const emit = defineEmits(["refreshGroups"]);
const { currentUsername, currentUserId } = storeToRefs(useUserStore());
const { myRequests } = storeToRefs(useGroupStore());

async function sendRequestToJoin(groupId: ObjectId) {
  try {
    await fetchy(`/api/group/${groupId}`, "POST", {
      body: { userId: currentUserId.value },
    });
  } catch (_) {
    return;
  }

  emit("refreshGroups");
}

onBeforeMount(async () => {});
</script>

<template>
  <img :src="props.group.imageUrl" alt="photo" @dragstart="(e) => e.preventDefault()" />
  <div class="groupInfo">
    <h1 class="name">{{ props.group.name }}</h1>
    <div class="members-box">
      <article class="members">
        <h3>{{ users.join(", ") }}</h3>
      </article>
    </div>
    <div class="actions">
      <menu v-if="!users.includes(currentUsername) && !(myRequests ?? []).map((request) => request.groupId).includes(props.group._id)">
        <li><button class="btn-big pure-button brown" @click="() => sendRequestToJoin(props.group._id)">Request to Join</button></li>
      </menu>
      <menu v-else-if="!users.includes(currentUsername) && (myRequests ?? []).map((request) => request.groupId).includes(props.group._id)">
        <li><button class="btn-big pure-button lightBrown">Request Pending...</button></li>
      </menu>
      <div class="base">
        <article class="timestamp">
          <p v-if="props.group.dateCreated !== props.group.dateUpdated">Edited on: {{ formatDate(props.group.dateUpdated) }}</p>
          <p v-else>Created on: {{ formatDate(props.group.dateCreated) }}</p>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
p {
  margin: 0em;
}

.name {
  font-weight: bold;
  font-size: 1.2em;
}

.members-box {
  /* margin: 20px; */
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
  align-self: end;
  font-size: 0.9em;
  font-style: italic;
}

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

img {
  border: 1px solid #ccc; /* Optional border for images */
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 50%;
}

.brown {
  background-color: #735751; /* Brown color for Borrow button */
  color: white; /* Text color for Borrow button */
}

.lightBrown {
  background-color: #f4edde; /* Brown color for Borrow button */
  color: #735751; /* Text color for Borrow button */
}
.green {
  background-color: #a5a58d; /* Green color for Return button */
  color: white; /* Text color for Return button */
}
</style>
