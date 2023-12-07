<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { fetchy } from "../../utils/fetchy";

import { ObjectId } from "mongodb";
import { storeToRefs } from "pinia";
import { defineProps, onBeforeMount } from "vue";

const props = defineProps(["group", "allUsers", "allRequests"]);
const users: Array<string> = props.group.members.map((id: string) => props.allUsers[id]);
const emit = defineEmits(["refreshGroups"]);
const { currentUsername, currentUserId } = storeToRefs(useUserStore());

async function sendRequestToJoin(groupId: ObjectId) {
  try {
    await fetchy(`/api/group/${groupId}`, "POST", {
      body: { userId: currentUserId.value },
    });
    console.log("sent request");
  } catch (_) {
    return;
  }
}

onBeforeMount(async () => {});

console.log("username is " + currentUsername.value);
</script>

<template>
  <img :src="props.group.imageUrl" alt="photo" />
  <div class="groupInfo">
    <h1 class="name">{{ props.group.name }}</h1>
    <!-- <menu>
    <li><button class="btn-small pure-button brown" @click="borrowClothingItem">Join</button></li>
    <li><button class="btn-small pure-button green" @click="deleteClothingItem">Return</button></li>
  </menu> -->
    <div class="members-box">
      <article class="members">
        <h3>{{ users.join(",") }}</h3>
      </article>
    </div>
    <div class="actions">
      <menu v-if="!users.includes(currentUsername)">
        <li><button class="btn-big pure-button brown" @click="() => sendRequestToJoin(props.group._id)">Request to Join</button></li>
        <!-- <li><button class="btn-small pure-button green" @click="deleteClothingItem">Return</button></li> -->
      </menu>
      <div class="base">
        <!-- <menu v-if="props.clothingItem.owner == currentUsername">
      <li><button class="btn-small pure-button" @click="emit('editClothingItem', props.clothingItem._id)">Edit</button></li>
      <li><button class="button-error btn-small pure-button" @click="deleteClothingItem">Delete</button></li>
    </menu> -->
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
  margin: 20px;
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
  max-width: 150px; /* Default */
  height: auto; /* Maintain aspect ratio */
  border: 1px solid #ccc; /* Optional border for images */
  border-radius: 100em;
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
