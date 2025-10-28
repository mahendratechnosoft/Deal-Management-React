// src/utils/auth.js
export const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};
