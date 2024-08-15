import { fetchAccessToken } from "@humeai/voice";

export const getHumeAccessToken = async () => {
  console.log(import.meta.env.VITE_HUME_CLIENT_SECRET);
  const accessToken = await fetchAccessToken({
    apiKey: import.meta.env.VITE_HUME_API_KEY,
    clientSecret: import.meta.env.VITE_HUME_CLIENT_SECRET,
  });

  if (accessToken === "undefined") {
    return null;
  }

  return accessToken ?? null;
};
