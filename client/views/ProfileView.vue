<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import GroupsOnProfile from "../components/Group/GroupsOnProfile.vue";
import ReviewsOnProfile from "../components/Review/ReviewsOnProfile.vue";
import StoreListComponent from "../components/Store/StoreListComponent.vue";
import router from "../router";

const route = useRoute();
const username = ref("");
onMounted(async () => {
  username.value = route.params.username as string;
});
const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

function goToSettings() {
  router.push({ name: "Settings", params: { username: currentUsername.value } });
}
</script>

<template>
  <section>
    <h1 v-if="isLoggedIn && username == currentUsername">
      <button @click="goToSettings"><img class="settings-button" src="@/assets/images/settings.png" /></button>
    </h1>
  </section>
  <main class="column">
    <div>
      <h1>{{ currentUsername }}'s Profile</h1>
    </div>
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
.settings-button {
  height: 1em;
}
</style>
