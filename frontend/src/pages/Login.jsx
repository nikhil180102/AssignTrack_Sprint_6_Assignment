import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

import { EyeSlashIcon, EyeIcon } from "@heroicons/react/24/solid";

import { forgotPasswordApi, loginApi, resetPasswordApi } from "../api/auth.api";
import { userAPI } from "../api/user.api";
import Modal from "../components/common/Modal";
import { loginSuccess } from "../features/auth/authSlice";
import { validateLogin, validateStrongPassword } from "../utils/validation";
import { getDashboardRoute } from "../utils/roleRedirect";
import { saveAuth } from "../utils/auth";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [passwordShown, setPasswordShown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [otpStep, setOtpStep] = useState("request");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpForm, setOtpForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
  });

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const togglePassword = () => setPasswordShown((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateLogin(form);
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);

    try {
      const res = await loginApi({
        email: form.email,
        password: form.password,
      });

      const token = res.data.data.token;
      const decoded = jwtDecode(token);
      console.log(token);
      console.log(decoded);

      const authority = decoded.authorities?.[0] || "";
      const role = authority.startsWith("ROLE_")
        ? authority.replace("ROLE_", "")
        : authority;

      const user = {
        role,
        email: decoded.sub || "",
        id: decoded.userId || null,
      };

      saveAuth({ token, role, userId: user.id, email: user.email });

      let profile = null;
      try {
        const profileRes = await userAPI.getMyProfile();
        profile = profileRes?.data?.data || null;
      } catch (e) {
      }

      const firstName = profile?.firstName || decoded?.firstName || "";
      const lastName = profile?.lastName || decoded?.lastName || "";
      const email = profile?.email || user.email || "";

      saveAuth({ token, role, userId: user.id, email, firstName, lastName });
      dispatch(
        loginSuccess({
          token,
          user: { ...user, email, firstName, lastName },
        }),
      );

      toast.success("Welcome back");
      navigate(getDashboardRoute(role));
    } catch (err) {
      const status = err.response?.status;
      const serverMessage = err.response?.data?.message;
      if (status === 503) return;

      if (status === 400 || status === 401 || status === 403 || status === 500) {
        toast.error(serverMessage || "Invalid email or password", {
          duration: 4500,
        });
        return;
      }

      toast.error(serverMessage || "Login failed. Please try again.", {
        duration: 4500,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!otpForm.email) {
      toast.error("Please enter your email");
      return;
    }
    try {
      setOtpLoading(true);
      const res = await forgotPasswordApi({ email: otpForm.email });
      const message = res?.data?.message || "OTP sent to your email";
      toast.success(message);
      setOtpStep("reset");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otpForm.email || !otpForm.otp || !otpForm.newPassword) {
      toast.error("Please fill all fields");
      return;
    }
    const passwordError = validateStrongPassword(otpForm.newPassword);
    if (passwordError) {
      toast.error(passwordError, { duration: 4500 });
      return;
    }
    try {
      setOtpLoading(true);
      await resetPasswordApi({
        email: otpForm.email,
        otp: otpForm.otp,
        newPassword: otpForm.newPassword,
      });
      toast.success("Password reset successfully");
      setShowForgotModal(false);
      setOtpStep("request");
      setOtpForm({ email: "", otp: "", newPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <section
      className="min-h-screen flex items-center justify-center
      bg-gradient-to-br from-gray-50 to-gray-200
      dark:from-gray-900 dark:to-gray-800 p-4"
    >
      <div
        className="w-full max-w-md
        backdrop-blur-xl bg-white/30 dark:bg-gray-800/30
        border border-white/20 dark:border-gray-700/40
        shadow-2xl rounded-2xl p-8"
      >
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 text-center">
          Welcome Back
        </h1>

        <p className="text-gray-600 dark:text-gray-300 text-center mt-2 mb-8">
          Sign in to continue your journey.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
<div>
            <label className="block mb-1 font-medium text-gray-800 dark:text-gray-200">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl
              bg-white/60 dark:bg-gray-700/50
              border border-gray-300 dark:border-gray-600
              text-gray-900 dark:text-gray-200
              backdrop-blur-md shadow-inner
              focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your email"
            />
          </div>
<div>
            <label className="block mb-1 font-medium text-gray-800 dark:text-gray-200">
              Password
            </label>

            <div className="relative">
              <input
                type={passwordShown ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl
                bg-white/60 dark:bg-gray-700/50
                border border-gray-300 dark:border-gray-600
                text-gray-900 dark:text-gray-200
                backdrop-blur-md shadow-inner
                focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
              />

              <span
                onClick={togglePassword}
                className="absolute right-3 top-3 cursor-pointer
                text-gray-600 dark:text-gray-300"
              >
                {passwordShown ? (
                  <EyeIcon className="h-5 w-5" />
                ) : (
                  <EyeSlashIcon className="h-5 w-5" />
                )}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-xl
            bg-gradient-to-r from-indigo-600 to-indigo-800
            text-white font-medium
            shadow-lg shadow-indigo-500/30
            transition-all
            ${loading ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"}`}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <div className="text-right">
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <p className="text-center text-gray-700 dark:text-gray-300 mt-2">
            Don&apos;t have an account?
            <span
              onClick={() => navigate("/register")}
              className="ml-1 cursor-pointer font-medium
              text-indigo-600 dark:text-indigo-400"
            >
              Register
            </span>
          </p>
        </form>
      </div>
<button
        onClick={() => navigate("/")}
        className="absolute top-5 left-5 z-50 px-4 py-2
        rounded-xl bg-gray-200/70 dark:bg-gray-700/70
        text-gray-800 dark:text-gray-200 shadow-md
        hover:bg-gray-300 dark:hover:bg-gray-600 transition"
      >
        Back
      </button>

      <Modal
        isOpen={showForgotModal}
        onClose={() => {
          setShowForgotModal(false);
          setOtpStep("request");
        }}
        title="Reset Password"
        size="sm"
      >
        {otpStep === "request" ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium text-gray-800">
                Email
              </label>
              <input
                type="email"
                value={otpForm.email}
                onChange={(e) =>
                  setOtpForm({ ...otpForm, email: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-900 focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your email"
              />
            </div>
            <button
              type="submit"
              disabled={otpLoading}
              className={`w-full py-2.5 rounded-xl bg-indigo-600 text-white font-medium transition-all ${
                otpLoading
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:opacity-90"
              }`}
            >
              {otpLoading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium text-gray-800">
                Email
              </label>
              <input
                type="email"
                value={otpForm.email}
                onChange={(e) =>
                  setOtpForm({ ...otpForm, email: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-800">
                OTP
              </label>
              <input
                type="text"
                value={otpForm.otp}
                onChange={(e) =>
                  setOtpForm({ ...otpForm, otp: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-900 focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter OTP"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-800">
                New Password
              </label>
              <input
                type="password"
                value={otpForm.newPassword}
                onChange={(e) =>
                  setOtpForm({ ...otpForm, newPassword: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-900 focus:ring-2 focus:ring-indigo-500"
                placeholder="New password"
              />
            </div>
            <button
              type="submit"
              disabled={otpLoading}
              className={`w-full py-2.5 rounded-xl bg-indigo-600 text-white font-medium transition-all ${
                otpLoading
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:opacity-90"
              }`}
            >
              {otpLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </Modal>
    </section>
  );
};

export default Login;
