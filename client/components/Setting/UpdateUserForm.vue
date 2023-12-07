<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { ref } from "vue";
import ImageUploader from "../ClothingItem/ImageUploader.vue";

let username = ref("");
let password = ref("");
let photoUrl = ref("");

const { updateUser, updateSession } = useUserStore();

async function updateProfilePicture() {}
async function updateUsername() {
  await updateUser({ username: username.value });
  await updateSession();
  username.value = "";
}

async function updatePassword() {
  await updateUser({ password: password.value });
  await updateSession();
  password.value = "";
}

const handleImageUpload = async (url: string) => {
  photoUrl.value = url;
  await updateUser({ displayPhotoUrl: photoUrl.value });
  await updateSession();
  photoUrl.value = "";
};
</script>

<template>
  <h2>Update user details</h2>
  <form @submit.prevent="updateProfilePicture" class="pure-form">
    <ImageUploader @uploadImage="handleImageUpload" />
  </form>

  <form @submit.prevent="updateUsername" class="pure-form">
    <fieldset>
      <legend>Change your username</legend>
      <input type="text" placeholder="New username" v-model="username" required />
      <button type="submit" class="pure-button pure-button-primary">Update username</button>
    </fieldset>
  </form>

  <form @submit.prevent="updatePassword" class="pure-form">
    <fieldset>
      <legend>Change your password</legend>
      <input type="password" placeholder="New password" v-model="password" required />
      <button type="submit" class="pure-button pure-button-primary">Update password</button>
    </fieldset>
  </form>
</template>
