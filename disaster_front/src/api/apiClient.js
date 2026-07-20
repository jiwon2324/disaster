import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      const authToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
      const rawToken = token.startsWith("Bearer ") ? token.replace("Bearer ", "") : token;
      config.headers.Authorization = authToken;
      config.headers["X-AUTH-TOKEN"] = rawToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
