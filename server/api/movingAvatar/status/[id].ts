export default defineEventHandler(async (event) => {
  const taskId = getRouterParam(event, "id");

  if (!taskId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Task ID is required",
    });
  }

  const runway = useRunway();
  return runway.tasks.retrieve(taskId);
});
