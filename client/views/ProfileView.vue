<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import ClosetListComponent from "../components/Closet/ClosetListComponent.vue";
import GroupsOnProfile from "../components/Group/GroupsOnProfile.vue";
import router from "../router";

const route = useRoute();
const username = ref("");
const DEFAULT_PHOTO = "/client/assets/images/blankProfile.png";
onMounted(async () => {
  username.value = route.params.username as string;
});
const { currentProfilePhoto, currentUsername, isLoggedIn } = storeToRefs(useUserStore());
async function goToSettings() {
  await router.push({ name: "Settings", params: { username: currentUsername.value } });
}

const goToCloset = async () => {
  await router.push({ name: "Closet", params: { username: currentUsername.value } });
};
</script>

<template>
  <section>
    <h1 v-if="isLoggedIn && username == currentUsername">
      <button class="settings-button" @click="goToSettings"><img class="settings-image" src="@/assets/images/settings.png" /></button>
    </h1>
  </section>
  <main class="column">
    <center>
      <h1>{{ currentUsername }}'s Profile</h1>
      <img v-if="currentProfilePhoto" class="photo" :src="currentProfilePhoto" alt="photo" />
      <img v-else class="photo" :src="DEFAULT_PHOTO" alt="photo" />
    </center>
    <div class="two-columns">
      <div class="column">
        <div class="button-container" @click="goToCloset">
          <h2 class="button-text">add items to your closet</h2>
        </div>
        <ClosetListComponent :username="currentUsername" :onCloset="false" />
      </div>
      <div class="column">
        <GroupsOnProfile />
      </div>
    </div>
  </main>
</template>

<style>
.photo {
  width: 150px;
  display: flex;
}

.two-columns {
  display: flex;
  gap: 20px;
}
.column {
  flex: 1;
  margin-top: 50px;
}

.settings-image {
  height: 1em;
  display: flex;
  justify-content: center;
  align-self: center;
}
.settings-button {
  margin-left: 80%;
}

.button-text {
  margin: 0px;
}

.button-container {
  padding: 10px;
  padding-inline: 50px;
  background-color: var(--gray);
  border-radius: 10px;
}

.button-container:hover {
  background-color: var(--gray-hover);
  cursor: pointer;
}
</style>
