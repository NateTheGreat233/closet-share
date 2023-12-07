<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import GroupsOnProfile from "../components/Group/GroupsOnProfile.vue";
import ReviewsOnProfile from "../components/Review/ReviewsOnProfile.vue";
import UpdateUserForm from "../components/Setting/UpdateUserForm.vue";
import StoreListComponent from "../components/Store/StoreListComponent.vue";

const { currentUsername } = storeToRefs(useUserStore());
const { logoutUser, deleteUser } = useUserStore();

async function logout() {
  await logoutUser();
  void router.push({ name: "Home" });
}

async function delete_() {
  await deleteUser();
  void router.push({ name: "Home" });
}
</script>

<template>
  <main class="column">
    <h1>Settings for {{ currentUsername }}</h1>
    <button class="pure-button pure-button-primary" @click="logout">Logout</button>
    <button class="button-error pure-button" @click="delete_">Delete User</button>
    <UpdateUserForm />
    <div>
      <h1>My Closet</h1>
      <StoreListComponent />
    </div>
    <div class="two-columns">
      <div class="column">
        <ReviewsOnProfile />
      </div>
      <div class="column">
        <GroupsOnProfile />
      </div>
    </div>
  </main>
</template>

<style>
.two-columns {
  display: flex;
  gap: 20px;
}
.column {
  flex: 1;
}
</style>
