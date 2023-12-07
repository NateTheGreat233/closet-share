<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import router from "../../router";

const currentRoute = useRoute();
const currentRouteName = computed(() => currentRoute.name);
const userStore = useUserStore();
const { isLoggedIn, currentUsername } = storeToRefs(userStore);

// string to display -> link name
const links = ref<Map<string, string>>(
  new Map([
    ["dashboard", "Dashboard"],
    ["borrowed", "Borrowed"],
    ["closet", "Closet"],
    ["groups", "Groups"],
    ["profile", "Profile"],
    // ["settings", "Settings"],
  ]),
);

const onLinkClick = async (linkName: string): Promise<void> => {
  console.log(linkName);
  await router.push({ name: linkName, params: { username: currentUsername.value } });
};
</script>

<template>
  <div class="container">
    <img class="shirt-logo" src="@/assets/images/logo.png" @dragstart="(e) => e.preventDefault()" />
    <h1 class="title">ClosetShare</h1>
    <div class="link-container">
      <h2 v-if="!isLoggedIn" class="link selected">Login</h2>
      <div v-else v-for="[displayName, routeName] in links">
        <h2 class="link" :class="{ selected: currentRouteName === routeName }" @click="() => onLinkClick(routeName)">{{ displayName }}</h2>
      </div>
      <!-- <RouterLink :to="{ name: route }">hello</RouterLink> -->
      <!-- <li>
        <RouterLink :to="{ name: 'Home' }" :class="{ underline: currentRouteName == 'Home' }"> Home </RouterLink>
      </li>
      <li v-if="isLoggedIn">
        <RouterLink :to="{ name: 'Closet', params: { username: currentUsername } }" :class="{ underline: currentRouteName == 'Closet' }"> My Closet </RouterLink>
      </li>
      <li v-if="isLoggedIn">
        <RouterLink :to="{ name: 'Settings' }" :class="{ underline: currentRouteName == 'Settings' }"> Settings </RouterLink>
      </li>
      <li v-else>
        <RouterLink :to="{ name: 'Login' }" :class="{ underline: currentRouteName == 'Login' }"> Login </RouterLink>
      </li> -->
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100vw;
  height: 200px;
}

.shirt-logo {
  width: 50px;
  margin-top: 10px;
  margin-bottom: 5px;
}

.title {
  margin: 0px;
  margin-bottom: 10px;
  user-select: none;
}

.link-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 100px;
  width: 100%;
  height: 60px;
  background-color: var(--beige);
}

.link {
  user-select: none;
}

.link:hover {
  cursor: pointer;
}

.selected {
  text-decoration: underline;
}
</style>
