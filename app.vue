<script setup lang="ts">
import { UseElementVisibility } from "@vueuse/components";
const files = ref<
  {
    file: File;
    base64: string;
    id: string;
  }[]
>([]);

const { data: avatars, execute: fetchAvatars } = await useFetch(
  "/api/movingAvatar"
);

const showImmediate = ref<File | undefined>();
const { base64: previewImmediate } = useBase64(showImmediate);

async function handleFileUpload(e: Event) {
  try {
    const file = (e.target as HTMLInputElement).files?.[0];
    showImmediate.value = file;
    if (file) {
      const base64 = await blobToBase64(file);
      const res = await $fetch("/api/movingAvatar/generate", {
        method: "POST",
        body: {
          url: base64,
        },
      });

      files.value.push({
        file,
        base64,
        id: res.id,
      });
      await fetchAvatars();
      showImmediate.value = undefined;
    }
  } catch (err) {
    alert(err);
  }
}

let interval: ReturnType<typeof setInterval> | undefined;

const hasPending = computed(() => {
  return !!avatars.value?.find(
    (avatar) => ["PENDING", "RUNNING"].includes(avatar.status) || !avatar.status
  );
});

watch(
  avatars,
  () => {
    clearInterval(interval);
    if (hasPending.value) {
      interval = setInterval(fetchAvatars, 1000);
    }
  },
  {
    deep: true,
  }
);
</script>

<template>
  <div class="container">
    <h1>Moving Pravatar Experiement</h1>
    <div class="controls">
      <input
        :disabled="hasPending"
        type="file"
        accept="image/png, image/jpeg"
        @change="handleFileUpload"
      />
      <button @click="fetchAvatars()">Refresh</button>
    </div>
    <br />
    <div class="videos">
      <div v-for="avatar in avatars" :key="avatar.id">
        <UseElementVisibility v-slot="{ isVisible }">
          <template v-if="avatar.status === 'SUCCEEDED'">
            <video
              v-if="isVisible"
              :src="avatar.output?.at(0)"
              width="150"
              :autoplay="isVisible"
              loop
              muted
              class="video"
            />
            <div v-else class="video" style="width: 150px; height: 150px"></div>
          </template>
          <div
            v-if="
              (['RUNNING', 'PENDING'].includes(avatar.status) ||
                !avatar.status) &&
              files.find((f) => f.id === avatar.id)?.base64
            "
            class="loading"
          >
            <img
              :src="files.find((f) => f.id === avatar.id)?.base64"
              width="150"
              height="150"
            />
          </div>
          <div v-if="avatar.status === 'FAILED'" class="failed">Failed</div>
        </UseElementVisibility>
      </div>
      <div v-if="showImmediate" class="loading">
        <img :src="previewImmediate" width="150" height="150" />
      </div>
    </div>
  </div>
</template>

<style>
.video {
  /* 1x1 aspect ratio */
  aspect-ratio: 1/1;
  object-fit: cover;
  border-radius: 10px;
}

body {
  margin: 0;
  padding: 20px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #f5f5f5;
}

.container {
  max-width: 630px;
  margin: 0 auto;
  padding: 40px;
  margin-bottom: 500px;
}

button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  margin-right: 10px;
}

button:hover {
  background-color: #2980b9;
}

input[type="file"] {
  margin: 20px 0;
  padding: 10px;
  border: 2px dashed #ccc;
  border-radius: 6px;
  width: 100%;
  max-width: 400px;
}

img,
.video {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

img:hover,
.video:hover {
  transform: scale(1.05);
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

.loading {
  aspect-ratio: 1/1;
  background-color: #a6a6a6;
  border-radius: 10px;
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
  font-weight: bold;
  animation: pulse 2s infinite;
  overflow: hidden;
}

.failed {
  aspect-ratio: 1/1;
  border-radius: 10px;
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: red;
}

.videos {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}
h1 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.controls {
  position: sticky;
  top: 0;
  background-color: white;
  padding: 0px 10px;
  border-radius: 10px;

  display: flex;
  gap: 10px;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
}
</style>
