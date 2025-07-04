import axios from "axios";

let refreshingToken = null;

export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    console.error("No refresh token found. Need to log in again.");
    return null;
  }

  if (refreshingToken) {
    return refreshingToken;
  }

  refreshingToken = axios
    .post("http://127.0.0.1:8000/api/token/refresh/", { refresh: refreshToken })
    .then((response) => {
      console.log("New access token:", response.data.access);
      localStorage.setItem("accessToken", response.data.access);
      return response.data.access;
    })
    .catch((error) => {
      console.error(
        "Error refreshing token:",
        error.response?.data || error.message
      );
      return null;
    })
    .finally(() => {
      refreshingToken = null;
    });

  return refreshingToken;
};
