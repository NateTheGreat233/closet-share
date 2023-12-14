<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref } from "vue";
import CreateGroupPopup from "../components/Group/CreateGroupPopup.vue";
import GroupRequestsPopup from "../components/Group/GroupRequestsPopup.vue";
import GroupsListComponent from "../components/Group/GroupsListComponent.vue";
import PersonalRequestsPopup from "../components/Group/PersonalRequestsPopup.vue";
import { useGroupStore } from "../stores/group";

const showCreateGroupPopup = ref<boolean>(false);
const showRequestsPopup = ref<boolean>(false);
const showGroupRequestsPopup = ref<boolean>(false);

const { myRequests, myGroupRequests } = storeToRefs(useGroupStore());
</script>

<template>
  <div class="container">
    <div class="header">
      <h1>all groups</h1>
      <div class="button-group">
        <div class="button-container" @click="() => (showCreateGroupPopup = true)">
          <h2 class="button-text">create group</h2>
        </div>
        <div class="button-container" style="position: relative" @click="() => (showGroupRequestsPopup = true)">
          <h2 class="button-text">group approvals</h2>
          <div v-if="myGroupRequests !== undefined && myGroupRequests.length > 0" class="badge">
            <h4>{{ myGroupRequests.length }}</h4>
          </div>
        </div>
        <div class="button-container" style="position: relative" @click="() => (showRequestsPopup = true)">
          <h2 class="button-text">requested groups</h2>
          <div v-if="myRequests !== undefined && myRequests.length > 0" class="badge">
            <h4>{{ myRequests.length }}</h4>
          </div>
        </div>
      </div>
    </div>

    <CreateGroupPopup :visible="showCreateGroupPopup" @onClose="() => (showCreateGroupPopup = false)" />
    <PersonalRequestsPopup :visible="showRequestsPopup" @onClose="() => (showRequestsPopup = false)" />
    <GroupRequestsPopup :visible="showGroupRequestsPopup" @onClose="() => (showGroupRequestsPopup = false)" />
    <GroupsListComponent />
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  padding-left: 100px;
  padding-right: 100px;
  box-sizing: border-box;
  gap: 10px;
}

.badge {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: -10px;
  right: -10px;
  width: 25px;
  height: 25px;
  background-color: var(--beige);
  border-radius: 50%;
}

.header {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  align-items: center;
}

.button-group {
  display: flex;
  flex-direction: row;
  gap: 20px;
}

.button-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--gray);
  padding-right: 20px;
  padding-left: 20px;
  border-radius: 10px;
  height: 50px;
}

.button-container:hover {
  cursor: pointer;
  background-color: var(--gray-hover);
}

.button-text {
  margin: 0px;
}
</style>
