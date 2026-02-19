import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Input from "../components/common/Input";

import api from "../api/axios";
import { validateRegister } from "../utils/validation";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "STUDENT",
    expertise: "",
    experienceYears: "",
  });
  const [certificationFile, setCertificationFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateRegister(form);
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);

    try {
      const endpoint = form.role === "TEACHER" ? "/users/register/teacher" : "/users/students";
      let res;

      if (form.role === "TEACHER") {
        if (!form.expertise) {
          toast.error("Please select expertise");
          return;
        }

        const exp = Number(form.experienceYears);
        if (!Number.isInteger(exp) || exp < 0 || exp > 40) {
          toast.error("Experience must be a number between 0 and 40");
          return;
        }

        if (!certificationFile) {
          toast.error("Please upload one certification document");
          return;
        }

        const fileName = certificationFile.name?.toLowerCase() || "";
        const validType =
          fileName.endsWith(".pdf") ||
          fileName.endsWith(".doc") ||
          fileName.endsWith(".docx");

        if (!validType) {
          toast.error("Only PDF, DOC, DOCX files are allowed");
          return;
        }

        if (certificationFile.size > 10 * 1024 * 1024) {
          toast.error("Certification document must be <= 10 MB");
          return;
        }

        const formData = new FormData();
        formData.append("email", form.email);
        formData.append("password", form.password);
        formData.append("firstName", form.firstName);
        formData.append("lastName", form.lastName);
        formData.append("expertise", form.expertise);
        formData.append("experienceYears", String(exp));
        formData.append("certificationFile", certificationFile);

        res = await api.post(endpoint, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        const payload = {
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
        };
        res = await api.post(endpoint, payload);
      }

      const message =
        res?.data?.message ||
        (form.role === "TEACHER"
          ? "Registration done. Wait for admin approval to login."
          : "Account created successfully");

      toast.success(message, { duration: form.role === "TEACHER" ? 6000 : 3000 });
      setTimeout(() => navigate("/login"), form.role === "TEACHER" ? 2500 : 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="min-h-screen flex items-center justify-center
      bg-gradient-to-br from-gray-50 to-gray-200
      dark:from-gray-900 dark:to-gray-800 p-4"
    >
      <button
        onClick={() => navigate("/")}
        className="absolute top-5 left-5 z-50 px-4 py-2
        rounded-xl bg-gray-200/70 dark:bg-gray-700/70
        text-gray-800 dark:text-gray-200 shadow-md
        hover:bg-gray-300 dark:hover:bg-gray-600 transition"
      >
        Back
      </button>

      <div
        className="w-full max-w-2xl
        backdrop-blur-xl bg-white/30 dark:bg-gray-800/30
        border border-white/20 dark:border-gray-700/40
        shadow-2xl rounded-2xl p-8"
      >
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 text-center">
          Create Account
        </h1>

        <p className="text-gray-600 dark:text-gray-300 text-center mt-2 mb-8">
          Start your journey with us.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="Nick"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />

            <Input
              label="Last Name"
              placeholder="Doe"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="email"
              label="Email"
              placeholder="nick@test.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <Input
              type="password"
              label="Password"
              placeholder="********"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-800 dark:text-gray-200">
              Register As
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl
              bg-white/60 dark:bg-gray-700/50
              border border-gray-300 dark:border-gray-600
              text-gray-900 dark:text-gray-200
              shadow-inner backdrop-blur-md
              focus:ring-2 focus:ring-indigo-500"
            >
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Instructor</option>
            </select>
          </div>

          {form.role === "TEACHER" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-800 dark:text-gray-200">
                    Expertise
                  </label>
                  <select
                    value={form.expertise}
                    onChange={(e) => setForm({ ...form, expertise: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl
                    bg-white/60 dark:bg-gray-700/50
                    border border-gray-300 dark:border-gray-600
                    text-gray-900 dark:text-gray-200
                    shadow-inner backdrop-blur-md
                    focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select expertise</option>
                    <option value="JAVA">Java</option>
                    <option value="SPRING_BOOT">Spring Boot</option>
                    <option value="MICROSERVICES">Microservices</option>
                    <option value="REACT">React</option>
                    <option value="NODE_JS">Node.js</option>
                    <option value="DATA_STRUCTURES">Data Structures</option>
                    <option value="DATABASES">Databases</option>
                    <option value="DEVOPS">DevOps</option>
                  </select>
                </div>

                <Input
                  type="number"
                  label="Experience (Years)"
                  placeholder="e.g. 5"
                  min="0"
                  max="40"
                  value={form.experienceYears}
                  onChange={(e) =>
                    setForm({ ...form, experienceYears: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-800 dark:text-gray-200">
                  Supporting Document (PDF/DOC/DOCX, one file)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setCertificationFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2.5 rounded-xl
                  bg-white/60 dark:bg-gray-700/50
                  border border-gray-300 dark:border-gray-600
                  text-gray-900 dark:text-gray-200"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-xl
            bg-gradient-to-r from-indigo-600 to-indigo-800
            text-white font-medium shadow-lg shadow-indigo-500/30
            transition-all
            ${loading ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"}`}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>

          <p className="text-center text-gray-700 dark:text-gray-300 mt-2">
            Already have an account?
            <span
              onClick={() => navigate("/login")}
              className="ml-1 cursor-pointer font-medium
              text-indigo-600 dark:text-indigo-400"
            >
              Login
            </span>
          </p>
        </form>
      </div>
    </section>
  );
};

export default Register;

