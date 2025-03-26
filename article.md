# Building an Avatar Video Generator with Nuxt.js and Runway

In this tutorial, we'll build a modern web application that transforms static avatar images into dynamic videos using Nuxt.js and Runway's AI video generation capabilities. Our app will fetch avatar images from UI Avatars and use Runway's API to create engaging video animations.

## Prerequisites

Before we begin, make sure you have:

- Node.js installed (v16 or later)
- A Runway API key (sign up at [runway.ml](https://runway.ml))
- Basic familiarity with Vue.js and Nuxt.js

## Project Setup

First, let's create a new Nuxt.js project:

```bash
npx nuxi init avatar-video-generator
cd avatar-video-generator
npm install
```

We'll need to install some additional dependencies:

```bash
npm install @runway/sdk axios @nuxtjs/tailwind
```

## Project Structure

Our project will have the following key files:

```
avatar-video-generator/
├── components/
│   ├── AvatarGrid.vue
│   ├── ImageUploader.vue
│   └── VideoPreview.vue
├── pages/
│   └── index.vue
├── server/
│   └── api/
│       └── generate.ts
└── nuxt.config.ts
```

## Configuration

Let's set up our Nuxt configuration. Create or modify `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ["@nuxtjs/tailwind"],
  runtimeConfig: {
    runwayApiKey: process.env.RUNWAY_API_KEY,
  },
});
```

## Building the Components

### 1. Avatar Grid Component

Create `components/AvatarGrid.vue`:

```vue
<script setup>
const avatars = ref([]);
const selectedAvatar = ref(null);

const fetchAvatars = async () => {
  // Generate 12 random avatars
  avatars.value = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    url: `https://i.pravatar.cc/150?img=${i + 1}`,
  }));
};

onMounted(() => {
  fetchAvatars();
});
</script>

<template>
  <div class="grid grid-cols-3 md:grid-cols-4 gap-4 p-4">
    <div
      v-for="avatar in avatars"
      :key="avatar.id"
      class="relative cursor-pointer rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500"
      :class="{ 'ring-2 ring-blue-500': selectedAvatar === avatar }"
      @click="selectedAvatar = avatar"
    >
      <img :src="avatar.url" class="w-full h-full object-cover" />
    </div>
  </div>
</template>
```

### 2. Video Preview Component

Create `components/VideoPreview.vue`:

```vue
<script setup>
const props = defineProps({
  videoUrl: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="relative aspect-video rounded-lg overflow-hidden">
    <video
      v-if="videoUrl"
      :src="videoUrl"
      controls
      class="w-full h-full object-cover"
    ></video>
    <div
      v-else
      class="w-full h-full bg-gray-100 flex items-center justify-center"
    >
      <p class="text-gray-500">No video generated yet</p>
    </div>
  </div>
</template>
```

## Main Page Implementation

Create `pages/index.vue`:

```vue
<script setup>
const selectedAvatar = ref(null);
const generatedVideo = ref(null);
const isGenerating = ref(false);

const generateVideo = async () => {
  if (!selectedAvatar.value) return;

  isGenerating.value = true;
  try {
    const response = await $fetch("/api/generate", {
      method: "POST",
      body: {
        imageUrl: selectedAvatar.value.url,
      },
    });
    generatedVideo.value = response.videoUrl;
  } catch (error) {
    console.error("Error generating video:", error);
  } finally {
    isGenerating.value = false;
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto py-8 px-4">
    <h1 class="text-3xl font-bold mb-8">Avatar Video Generator</h1>

    <div class="grid md:grid-cols-2 gap-8">
      <div>
        <h2 class="text-xl font-semibold mb-4">Select an Avatar</h2>
        <AvatarGrid v-model="selectedAvatar" />
      </div>

      <div>
        <h2 class="text-xl font-semibold mb-4">Generated Video</h2>
        <VideoPreview :video-url="generatedVideo" />

        <button
          @click="generateVideo"
          :disabled="!selectedAvatar || isGenerating"
          class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
        >
          {{ isGenerating ? "Generating..." : "Generate Video" }}
        </button>
      </div>
    </div>
  </div>
</template>
```

## Server-side Implementation

Create `server/api/generate.ts`:

```typescript
import { Runway } from "@runway/sdk";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const runway = new Runway({ apiKey: config.runwayApiKey });

  const body = await readBody(event);
  const { imageUrl } = body;

  try {
    // Download the avatar image
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();

    // Generate video using Runway
    const model = await runway.model("text-to-video");
    const prediction = await model.generate({
      image: Buffer.from(imageBuffer),
      // Add any additional parameters required by Runway
    });

    return {
      videoUrl: prediction.output.url,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Error generating video",
    });
  }
});
```

## Environment Setup

Create a `.env` file in your project root:

```
RUNWAY_API_KEY=your_runway_api_key_here
```

## Running the Application

To start the development server:

```bash
npm run dev
```

## Conclusion

We've built a full-stack Nuxt.js application that:

1. Displays a grid of avatar images from UI Avatars
2. Allows users to select an avatar
3. Generates a video animation using Runway's AI
4. Displays the generated video in a preview player

This application demonstrates how to integrate modern AI video generation capabilities into a Nuxt.js application while maintaining a clean and user-friendly interface.

## Next Steps

To enhance this application, you could:

- Add error handling and loading states
- Implement video download functionality
- Add custom avatar upload capabilities
- Integrate more Runway video generation options
- Add authentication to protect the API endpoints

Remember to handle API rate limits and implement proper error handling in a production environment.
