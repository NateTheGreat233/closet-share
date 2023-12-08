<script setup lang="ts">
import Navbar from "@/components/Navbar/Navbar.vue";
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount, watchEffect } from "vue";
import { RouterView } from "vue-router";
import router from "./router";
import { useClothingItemStore } from "./stores/clothingItem";
import { useGroupStore } from "./stores/group";

const userStore = useUserStore();
const { isLoggedIn } = storeToRefs(userStore);
const { toast } = storeToRefs(useToastStore());
const { onSignIn } = useClothingItemStore();
const { groupStoreStartup } = useGroupStore();

// Make sure to update the session before mounting the app in case the user is already logged in
onBeforeMount(async () => {
  try {
    await userStore.updateSession();
  } catch {
    // User is not logged in
  }
});

watchEffect(async () => {
  if (!isLoggedIn.value) {
    // if unauthenticated, send to the login page
    router.push({ name: "Login" });
  } else {
    // if authenticated, let's grab all the data we need and persist in store(s)
    const allTasks = [onSignIn(), groupStoreStartup()];
    await Promise.all(allTasks);
  }
});
</script>

<template>
  <header>
    <Navbar />
    <article v-if="toast !== null" class="toast" :class="toast.style">
      <p>{{ toast.message }}</p>
    </article>
  </header>
  <RouterView />
</template>

<style scoped>
@import "./assets/toast.css";

h1 {
  font-size: 2em;
  margin: 0;
}

.title {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

img {
  height: 2em;
}

a {
  font-size: large;
  color: black;
  text-decoration: none;
}

ul {
  list-style-type: none;
  margin-left: auto;
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 1em;
}
</style>
