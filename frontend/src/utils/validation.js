
export const isValidEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

export const validateLogin = ({ email, password }) => {
  if (!email || !password){
    return "Please enter email and password";
  }

  if (!isValidEmail(email)) {
    return "Please enter a valid email address";
  }

  return "";
};
export const validateRegister = ({firstName, lastName, email, password, role,
}) => {
  if (!firstName || firstName.trim().length < 2) {
    return "First name must be at least 2 characters long";
  }

  if (!lastName || lastName.trim().length < 2) {
    return "Last name must be at least 2 characters long";
  }

  if (!email || !isValidEmail(email)) {
    return "Please enter a valid email address";
  }

  const passwordError = validateStrongPassword(password);
  if (passwordError) {
    return passwordError;
  }

  if (!role) {
    return "Please select a role";
  }

  return ""; //empty string means valid
};

export const validateStrongPassword = (password) => {
  if (!password || password.length < 6) {
    return "Password must be at least 6 characters long";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must include at least one uppercase letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must include at least one number";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must include at least one special character";
  }
  return "";
};
