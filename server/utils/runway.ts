import RunwayML from "@runwayml/sdk";

export function useRunway() {
  const { runwayApiKey } = useRuntimeConfig();

  return new RunwayML({
    apiKey: runwayApiKey,
  });
}
