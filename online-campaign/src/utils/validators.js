export const POST_CATEGORIES = ['Awareness', 'Education', 'Support', 'Prevention'];
export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const validatePost = ({ title, category, message, agreeGuidelines, imageError }) => {
  const errors = {};
  const cleanTitle = title.trim();
  const cleanMessage = message.trim();
  if (!cleanTitle) errors.title = 'A title is required.';
  else if (cleanTitle.length < 5) errors.title = 'Title must be at least 5 characters.';
  else if (cleanTitle.length > 100) errors.title = 'Title must be 100 characters or fewer.';
  if (!POST_CATEGORIES.includes(category)) errors.category = 'Choose a valid category.';
  if (!cleanMessage) errors.message = 'A message is required.';
  else if (cleanMessage.length < 20) errors.message = 'Message must be at least 20 characters.';
  else if (cleanMessage.length > 2000) errors.message = 'Message must be 2000 characters or fewer.';
  if (imageError) errors.image = imageError;
  if (!agreeGuidelines) errors.guidelines = 'Please agree to the community guidelines.';
  return errors;
};

export const validateLogin = ({ email, password }) => {
  const errors = {};
  if (!email.trim()) errors.email = 'Username or email is required.';
  if (!password) errors.password = 'Password is required.';
  return errors;
};

export const validateSignup = ({ name, email, password, confirmPassword }) => {
  const errors = {};
  const cleanName = name.trim();
  if (!cleanName) errors.name = 'Name is required.';
  else if (cleanName.length < 2 || cleanName.length > 50) errors.name = 'Name must be 2–50 characters.';
  if (!email.trim()) errors.email = 'Email address is required.';
  else if (!emailPattern.test(email.trim())) errors.email = 'Enter a valid email address.';
  if (!password) errors.password = 'Password is required.';
  else if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) errors.password = 'Use at least 8 characters with a letter and a number.';
  if (!confirmPassword) errors.confirmPassword = 'Please confirm your password.';
  else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';
  return errors;
};
