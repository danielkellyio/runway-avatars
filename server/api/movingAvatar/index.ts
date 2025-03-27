import type { generatedAvatar } from "~/types";

export default defineEventHandler(async (event) => {
  const storage = useStorage("data");
  const allKeys = await storage.getKeys();
  const allItems = await Promise.all(
    allKeys.map(async (key) => {
      return await storage.getItem<generatedAvatar>(key);
    })
  );
  return allItems
    .filter((item) => item !== null)
    .toSorted(
      (a, b) =>
        new Date(a!.createdAt).getTime() - new Date(b!.createdAt).getTime()
    ) as generatedAvatar[];
});
