import axios from "axios";

export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    console.error("⚠ No refresh token found. User needs to log in again.");
    return null;
  }

  try {
    console.log("🔄 Refreshing token...");
    const response = await axios.post(
      "http://127.0.0.1:8000/api/token/refresh/",
      {
        refresh: refreshToken,
      }
    );

    console.log("✅ New access token received:", response.data.access);
    localStorage.setItem("accessToken", response.data.access);
    return response.data.access;
  } catch (error) {
    console.error(
      "❌ Error refreshing token:",
      error.response?.data || error.message
    );
    return null;
  }
};
