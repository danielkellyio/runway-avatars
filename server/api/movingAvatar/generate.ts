import type { generatedAvatar } from "~/types";
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const imageUrl = body?.url; // https://pbs.twimg.com/profile_images/1543113237415215104/6MUa5Tta_400x400.jpg
    const prompt =
      "A moving avatar that looks around subtly, blinks, looks forward, and seems to be looking at the camera, seemless loop, centered with space on either side";

    const runway = useRunway();

    const imageToVideo = (await runway.imageToVideo.create({
      model: "gen3a_turbo",
      promptImage: imageUrl,
      promptText: prompt,
      duration: 5,
    })) as generatedAvatar;

    const storage = useStorage("data");

    const existingAvatars =
      (await storage.getItem<generatedAvatar[]>("avatars")) || [];
    await storage.setItem("avatars", [...existingAvatars, imageToVideo]);

    event.waitUntil(
      (async () => {
        let task: Awaited<ReturnType<typeof runway.tasks.retrieve>>;
        do {
          await sleep(1000);
          task = await runway.tasks.retrieve(imageToVideo.id);
          const existingAvatars =
            (await storage.getItem<generatedAvatar[]>("avatars")) || [];
          const index = existingAvatars.findIndex(
            (a) => a.id === imageToVideo.id
          );
          existingAvatars[index === -1 ? existingAvatars.length : index] = task;
          storage.setItem("avatars", existingAvatars);
        } while (!["SUCCEEDED", "FAILED"].includes(task.status));
      })()
    );

    return runway.tasks.retrieve(imageToVideo.id);
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to generate moving avatar",
    });
  }
});
