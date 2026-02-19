import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Login from "./Login";

const mocks = vi.hoisted(() => ({
  dispatchMock: vi.fn(),
  navigateMock: vi.fn(),
  loginApiMock: vi.fn(),
  forgotPasswordApiMock: vi.fn(),
  resetPasswordApiMock: vi.fn(),
  getMyProfileMock: vi.fn(),
  saveAuthMock: vi.fn(),
  jwtDecodeMock: vi.fn(),
  getDashboardRouteMock: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("react-redux", () => ({
  useDispatch: () => mocks.dispatchMock,
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mocks.navigateMock,
}));

vi.mock("react-hot-toast", () => ({
  default: {
    error: mocks.toastError,
    success: mocks.toastSuccess,
  },
}));

vi.mock("../api/auth.api", () => ({
  loginApi: mocks.loginApiMock,
  forgotPasswordApi: mocks.forgotPasswordApiMock,
  resetPasswordApi: mocks.resetPasswordApiMock,
}));

vi.mock("../api/user.api", () => ({
  userAPI: {
    getMyProfile: mocks.getMyProfileMock,
  },
}));

vi.mock("../utils/auth", () => ({
  saveAuth: mocks.saveAuthMock,
  getToken: () => null,
  getRole: () => null,
  clearAuth: vi.fn(),
}));

vi.mock("jwt-decode", () => ({
  jwtDecode: mocks.jwtDecodeMock,
}));

vi.mock("../utils/roleRedirect", () => ({
  getDashboardRoute: mocks.getDashboardRouteMock,
}));

describe("Login page validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows validation error and blocks API call when fields are empty", async () => {
    render(<Login />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(mocks.toastError).toHaveBeenCalledWith("Please enter email and password");
    expect(mocks.loginApiMock).not.toHaveBeenCalled();
  });

  it("shows validation error for invalid email format and blocks API call", async () => {
    render(<Login />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/enter your email/i), "bad@");
    const passwordInput = document.querySelector('input[type="password"]');
    await user.type(passwordInput, "Secret1@");
    fireEvent.submit(screen.getByRole("button", { name: /sign in/i }).closest("form"));

    expect(mocks.toastError).toHaveBeenCalledWith(
      "Please enter a valid email address"
    );
    expect(mocks.loginApiMock).not.toHaveBeenCalled();
  });

  it("submits successfully for email + password", async () => {
    render(<Login />);
    const user = userEvent.setup();

    mocks.loginApiMock.mockResolvedValue({
      data: { data: { token: "fake.jwt.token" } },
    });
    mocks.jwtDecodeMock.mockReturnValue({
      role: "ROLE_STUDENT",
      email: "john@example.com",
      userId: 42,
    });
    mocks.getMyProfileMock.mockResolvedValue({
      data: { data: { firstName: "John", lastName: "Doe" } },
    });
    mocks.getDashboardRouteMock.mockReturnValue("/student/dashboard");

    await user.type(screen.getByPlaceholderText(/enter your email/i), "john@example.com");
    const passwordInput = document.querySelector('input[type="password"]');
    await user.type(passwordInput, "Secret1@");
    fireEvent.submit(screen.getByRole("button", { name: /sign in/i }).closest("form"));

    await waitFor(() => {
      expect(mocks.loginApiMock).toHaveBeenCalledWith({
        email: "john@example.com",
        password: "Secret1@",
      });
    });
    expect(mocks.toastError).not.toHaveBeenCalled();
    expect(mocks.navigateMock).toHaveBeenCalledWith("/student/dashboard");
  });
});
