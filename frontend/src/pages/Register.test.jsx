import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Register from "./Register";

const mocks = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  postMock: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
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

vi.mock("../api/axios", () => ({
  default: {
    post: mocks.postMock,
  },
}));

describe("Register page validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows validation error and blocks API call when form is empty", async () => {
    render(<Register />);
    const user = userEvent.setup();

    const form = screen
      .getByRole("button", { name: /register/i })
      .closest("form");
    fireEvent.submit(form);

    expect(mocks.toastError).toHaveBeenCalledWith(
      "First name must be at least 2 characters long"
    );
    expect(mocks.postMock).not.toHaveBeenCalled();
  });

  it("shows validation error for invalid email", async () => {
    render(<Register />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/first name/i), "John");
    await user.type(screen.getByLabelText(/last name/i), "Doe");
    await user.type(screen.getByLabelText(/email/i), "bad-email");
    await user.type(screen.getByLabelText(/password/i), "Secret1@");
    const form = screen
      .getByRole("button", { name: /register/i })
      .closest("form");
    fireEvent.submit(form);

    expect(mocks.toastError).toHaveBeenCalledWith(
      "Please enter a valid email address"
    );
    expect(mocks.postMock).not.toHaveBeenCalled();
  });

  it("submits student registration to student endpoint", async () => {
    render(<Register />);
    const user = userEvent.setup();

    mocks.postMock.mockResolvedValue({ data: { message: "OK" } });

    await user.type(screen.getByLabelText(/first name/i), "John");
    await user.type(screen.getByLabelText(/last name/i), "Doe");
    await user.type(screen.getByLabelText(/email/i), "john@example.com");
    await user.type(screen.getByLabelText(/password/i), "Secret1@");
    const form = screen
      .getByRole("button", { name: /register/i })
      .closest("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mocks.postMock).toHaveBeenCalledWith("/users/students", {
        email: "john@example.com",
        password: "Secret1@",
        firstName: "John",
        lastName: "Doe",
      });
    });
  });

  it("submits teacher registration to teacher endpoint", async () => {
    render(<Register />);
    const user = userEvent.setup();

    mocks.postMock.mockResolvedValue({ data: { message: "OK" } });

    await user.type(screen.getByLabelText(/first name/i), "Jane");
    await user.type(screen.getByLabelText(/last name/i), "Smith");
    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/password/i), "Secret1@");
    await user.selectOptions(screen.getByRole("combobox"), "TEACHER");
    await user.selectOptions(screen.getByDisplayValue(/select expertise/i), "JAVA");
    await user.type(screen.getByLabelText(/experience \(years\)/i), "5");
    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(["dummy"], "certificate.pdf", { type: "application/pdf" });
    await user.upload(fileInput, file);
    const form = screen
      .getByRole("button", { name: /register/i })
      .closest("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mocks.postMock).toHaveBeenCalled();
    });

    const [url, body, config] = mocks.postMock.mock.calls[0];
    expect(url).toBe("/users/register/teacher");
    expect(body).toBeInstanceOf(FormData);
    expect(body.get("email")).toBe("jane@example.com");
    expect(body.get("password")).toBe("Secret1@");
    expect(body.get("firstName")).toBe("Jane");
    expect(body.get("lastName")).toBe("Smith");
    expect(body.get("expertise")).toBe("JAVA");
    expect(body.get("experienceYears")).toBe("5");
    expect(body.get("certificationFile")).toBeTruthy();
    expect(config).toEqual({
      headers: { "Content-Type": "multipart/form-data" },
    });
  });
});

