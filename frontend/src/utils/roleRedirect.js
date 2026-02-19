export const getDashboardRoute = (role) => {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";

    case "TEACHER":
      return "/teacher/dashboard";

    case "STUDENT":
      return "/student/dashboard";

    default:
      return "/login";
  }
};

