export const saveAuth = ({ token, role, userId, email, firstName, lastName }) => {
  localStorage.setItem("accessToken", token);
  localStorage.setItem("role", role);
  if (userId) localStorage.setItem("userId", userId);
  if (email !== undefined) localStorage.setItem("email", email || "");
  if (firstName !== undefined) localStorage.setItem("firstName", firstName || "");
  if (lastName !== undefined) localStorage.setItem("lastName", lastName || "");
};

export const clearAuth = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
  localStorage.removeItem("email");
  localStorage.removeItem("firstName");
  localStorage.removeItem("lastName");
};

export const getToken = () => localStorage.getItem("accessToken");
export const getRole = () => localStorage.getItem("role");
export const getUserId = () => localStorage.getItem("userId");
export const getEmail = () => localStorage.getItem("email");
export const getFirstName = () => localStorage.getItem("firstName");
export const getLastName = () => localStorage.getItem("lastName");
export const isLoggedIn = () => !!getToken();
