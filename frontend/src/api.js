import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const getToken = () => localStorage.getItem("pi_token");
export const setToken = (token) => localStorage.setItem("pi_token", token);
export const removeToken = () => {
  localStorage.removeItem("pi_token");
  localStorage.removeItem("pi_name");
};

export const getPIName = () => localStorage.getItem("pi_name") || "Program In-charge";
export const setPIName = (name) => localStorage.setItem("pi_name", name);

// Axios Instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Authorization Bearer Token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized & Error formatting
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      return Promise.reject(new Error("Session expired or unauthorized. Please log in again."));
    }

    const detail = error.response?.data?.detail || error.message || "An unexpected error occurred.";
    return Promise.reject(new Error(detail));
  }
);

// API Endpoints
export const loginAPI = (email, password) => {
  return apiClient.post("/auth/login", { email, password });
};

export const getDashboardAPI = () => {
  return apiClient.get("/dashboard");
};

export const getBatchStudentsAPI = (batchId, search = "") => {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiClient.get(`/batches/${batchId}/students${query}`);
};

export const getStudentProfileAPI = (studentId) => {
  return apiClient.get(`/students/${studentId}`);
};

export const getMentorsAPI = () => {
  return apiClient.get("/mentors");
};

export const updateBatchMentorAPI = (batchId, newMentorId, reason) => {
  return apiClient.put(`/batches/${batchId}/mentor`, {
    new_mentor_id: parseInt(newMentorId, 10),
    reason: reason.trim(),
  });
};

export const getBatchMentorHistoryAPI = (batchId) => {
  return apiClient.get(`/batches/${batchId}/mentor-history`);
};

export default apiClient;
