import { describe, expect, it } from "vitest";
import { isValidEmail, validateLogin, validateRegister } from "./validation";

describe("validation utils", () => {
  it("accepts valid email format", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });

  it("rejects invalid email format", () => {
    expect(isValidEmail("user@domain")).toBe(false);
  });

  it("validateLogin returns error when email or password is missing", () => {
    expect(validateLogin({ email: "", password: "" })).toBe(
      "Please enter email and password"
    );
  });

  it("validateLogin returns error for invalid email", () => {
    expect(validateLogin({ email: "bad@", password: "Secret1@" })).toBe(
      "Please enter a valid email address"
    );
  });

  it("validateLogin returns empty string for valid email + password", () => {
    expect(validateLogin({ email: "john@example.com", password: "Secret1@" })).toBe("");
  });

  it("validateRegister requires first name with at least 2 chars", () => {
    expect(
      validateRegister({
        firstName: "A",
        lastName: "Doe",
        email: "john@example.com",
        password: "Secret1@",
        role: "STUDENT",
      })
    ).toBe("First name must be at least 2 characters long");
  });

  it("validateRegister requires last name with at least 2 chars", () => {
    expect(
      validateRegister({
        firstName: "John",
        lastName: "D",
        email: "john@example.com",
        password: "Secret1@",
        role: "STUDENT",
      })
    ).toBe("Last name must be at least 2 characters long");
  });

  it("validateRegister validates email", () => {
    expect(
      validateRegister({
        firstName: "John",
        lastName: "Doe",
        email: "bad-email",
        password: "Secret1@",
        role: "STUDENT",
      })
    ).toBe("Please enter a valid email address");
  });

  it("validateRegister validates password length", () => {
    expect(
      validateRegister({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "12345",
        role: "STUDENT",
      })
    ).toBe("Password must be at least 6 characters long");
  });

  it("validateRegister returns empty string for valid data", () => {
    expect(
      validateRegister({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "Secret1@",
        role: "TEACHER",
      })
    ).toBe("");
  });
});
