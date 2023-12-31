import { defineStore } from "pinia";
import { ref } from "vue";
import { fetchy } from "../utils/fetchy";
import { useUserStore } from "./user";

export const useGroupStore = defineStore(
  "group",
  () => {
    const allGroups = ref<Array<any>>();
    const myGroups = ref<Array<any>>([]);
    const myRequests = ref<Array<any>>();
    const myGroupRequests = ref<Array<any>>();

    const getAllGroups = async () => {
      try {
        allGroups.value = await fetchy(`/api/groups`, "GET");
      } catch (_) {
        return;
      }
    };

    async function getMyGroups() {
      try {
        const { currentUserId } = useUserStore();
        myGroups.value = await fetchy(`/api/groups/user/${currentUserId}`, "GET");
      } catch (_) {
        return;
      }
    }

    const getMyRequests = async () => {
      const { currentUserId } = useUserStore();
      try {
        const allRequests = await fetchy(`/api/groups/user/${currentUserId}/requests`, "GET");
        myRequests.value = allRequests.filter((request: any) => request.status === "pending");
      } catch (_) {
        return;
      }
    };

    const getMyGroupRequests = async () => {
      try {
        const { currentUserId } = useUserStore();
        const myGroups = (allGroups.value ?? []).filter((group) => group.members.includes(currentUserId));
        let requests: any[] = [];
        for (const group of myGroups) {
          requests = requests.concat(await fetchy(`/api/group/${group._id}/requests`, "GET"));
        }
        myGroupRequests.value = requests.filter((request) => request.status === "pending");
      } catch (_) {
        return;
      }
    };

    const groupStoreStartup = async () => {
      const tasks = [getMyRequests(), getAllGroups()];
      await Promise.all(tasks);
      await getMyGroupRequests();
    };

    const resetStore = () => {
      myGroupRequests.value = undefined;
      allGroups.value = undefined;
      myRequests.value = undefined;
    };

    return {
      allGroups,
      myRequests,
      myGroups,
      myGroupRequests,
      groupStoreStartup,
      getMyRequests,
      getAllGroups,
      getMyGroups,
      resetStore,
    };
  },
  { persist: true },
);
