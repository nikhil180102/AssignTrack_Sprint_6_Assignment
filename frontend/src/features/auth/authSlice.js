import { createSlice } from "@reduxjs/toolkit";
import { getRole, getToken, getUserId, getEmail, getFirstName, getLastName } from "../../utils/auth";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: getToken(),
    user: getRole()
      ? {
          role: getRole(),
          id: getUserId(),
          email: getEmail(),
          firstName: getFirstName(),
          lastName: getLastName(),
        }
      : null,
    isAuthenticated: !!getToken(),
  },
  reducers: {
    loginSuccess(state, action) {
      state.token = action.payload.token || state.token;
      state.user = action.payload.user || state.user;
      state.isAuthenticated = true;
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      localStorage.removeItem("email");
      localStorage.removeItem("firstName");
      localStorage.removeItem("lastName");
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
