<script setup lang="ts">
import { initializeApp } from "firebase/app";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { defineEmits, ref as refVue } from "vue";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCWuh7FQ21VaNXuDspSsasyfo_4ufBYOPM",
  authDomain: "closetshare-49a0a.firebaseapp.com",
  projectId: "closetshare-49a0a",
  storageBucket: "closetshare-49a0a.appspot.com",
  messagingSenderId: "138925992984",
  appId: "1:138925992984:web:5e0a0715b35f8fc868676d",
  measurementId: "G-N1BY2JVQRC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const imageUpload = refVue();
const imageUrl = refVue();
const emit = defineEmits(["uploadImage"]);

const uploadImage = () => {
  if (imageUpload.value == null) return;
  const imageRef = ref(storage, `images/${imageUpload.value.name + uuidv4()}`);
  uploadBytes(imageRef, imageUpload.value)
    .then((snapshot) => {
      getDownloadURL(snapshot.ref)
        .then((url) => {
          imageUrl.value = url;
          emit("uploadImage", url);
          alert("Image uploaded!");
        })
        .catch((error) => {
          console.log("Error getting download URL:", error);
        });
      //   alert("Image uploaded!");
    })
    .catch((error) => {
      console.log("Error uploading image:", error);
    });
  emptyForm();
};

const emptyForm = () => {
  imageUpload.value = "";
};

function handleImageUpload(event: Event) {
  if (event.target) {
    const eventTarget = event.target as HTMLInputElement;
    if (eventTarget?.files?.length) {
      imageUpload.value = eventTarget.files[0];
    }
  }
}
</script>

<template>
  <div>
    <img v-if="imageUrl" :src="imageUrl" alt="your uploaded image" />
    <br />
    <input type="file" @change="handleImageUpload" />
    <button @click="uploadImage">Upload</button>
    <br />
  </div>
</template>

<style scoped>
img {
  max-height: 300px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #8dacc4;
  color: #f9f9f0;
  font-weight: bold;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #6c9cb6;
}
</style>
