<script setup lang="ts">
import GroupsOnProfile from "../components/Group/GroupsOnProfile.vue";
import ReviewsOnProfile from "../components/Review/ReviewsOnProfile.vue";
import StoreListComponent from "../components/Store/StoreListComponent.vue";
</script>

<template>
  <main class="column">
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
