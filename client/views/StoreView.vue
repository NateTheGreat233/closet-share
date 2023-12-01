<script setup lang="ts">
import StoreListComponent from "@/components/Store/StoreListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

//eventually want to be able to see each user
const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
const route = useRoute();
const username = ref("");

onMounted(async () => {
  username.value = route.params.username as string;
});
</script>

<template>
  <main>
    <h1>@{{ username }}'s Closet</h1>
    <StoreListComponent v-if="username" :username="username" />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
