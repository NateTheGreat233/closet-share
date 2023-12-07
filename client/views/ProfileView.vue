<script setup lang="ts">
import ClosetListComponent from "../components/Closet/ClosetListComponent.vue";
import GroupsOnProfile from "../components/Group/GroupsOnProfile.vue";
import ReviewsOnProfile from "../components/Review/ReviewsOnProfile.vue";
</script>

<template>
  <main class="column">
    <div>
      <h1>My Closet</h1>
      <ClosetListComponent />
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
