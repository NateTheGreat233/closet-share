import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { BodyT, fetchy } from "@/utils/fetchy";
export const useUserStore = defineStore(
  "user",
  () => {
    const currentUsername = ref("");
    const currentProfilePhoto = ref("");
    const currentUserId = ref("");
    const isLoggedIn = computed(() => currentUsername.value !== "");

    const resetStore = () => {
      currentUsername.value = "";
    };

    const createUser = async (username: string, password: string) => {
      await fetchy("/api/users", "POST", {
        body: { username, password },
      });
    };

    const loginUser = async (username: string, password: string) => {
      await fetchy("/api/login", "POST", {
        body: { username, password },
      });
    };

    const updateSession = async () => {
      try {
        const { username, displayPhotoUrl, _id } = await fetchy("/api/session", "GET", { alert: false });
        currentProfilePhoto.value = displayPhotoUrl;
        currentUsername.value = username;
        currentUserId.value = _id;
      } catch {
        currentUsername.value = "";
        currentProfilePhoto.value = "";
        currentUserId.value = "";
      }
    };

    const logoutUser = async () => {
      await fetchy("/api/logout", "POST");
      resetStore();
    };

    const updateUser = async (patch: BodyT) => {
      await fetchy("/api/users", "PATCH", { body: { update: patch } });
    };

    const deleteUser = async () => {
      await fetchy("/api/users", "DELETE");
      resetStore();
    };

    return {
      currentProfilePhoto,
      currentUsername,
      currentUserId,
      isLoggedIn,
      createUser,
      loginUser,
      updateSession,
      logoutUser,
      updateUser,
      deleteUser,
    };
  },
  { persist: true },
);
