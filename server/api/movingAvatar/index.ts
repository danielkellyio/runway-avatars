import type { generatedAvatar } from "~/types";

export default defineEventHandler(async (event) => {
  const storage = useStorage("data");
  return (await storage.getItem<generatedAvatar[]>("avatars")) || [];
});
