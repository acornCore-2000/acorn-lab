import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let isRefreshing = false;

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry && 
      originalRequest.url !== "/api/refresh"
    ) {
      originalRequest._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;

          await api.post("/api/refresh");

          isRefreshing = false;

          return api(originalRequest);
        }
      } catch (refreshError) {
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    if (error.response) {
      console.log("API Error:", error.response.status);
    }

    return Promise.reject(error);
  }
);

export default api;