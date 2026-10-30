import { useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { validateSignup } from '../utils/validators';
import './AuthPages.css';

const SignupPage = ({ setActiveTab }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);
  const { register, googleLogin } = useAuth();
  const values = { name, email, password, confirmPassword };
  const refs = { name: nameRef, email: emailRef, password: passwordRef, confirmPassword: confirmRef };
  const googleButtonWidth = Math.min(400, Math.max(220, window.innerWidth - 56));

  const handleChange = (field, value, setter) => {
    const next = { ...values, [field]: value };
    setter(value);
    setErrors((current) => ({ ...current, [field]: validateSignup(next)[field] }));
    setNotice('');
  };

  const handleGoogleSuccess = async ({ credential } = {}) => {
    if (!credential) {
      setNotice('Google did not return a sign-in credential. Check the Google OAuth client configuration.');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await googleLogin(credential);
      if (result.error) { setNotice(result.error); return; }
      setNotice('Account created. You are now signed in.');
      setActiveTab('campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const next = validateSignup(values);
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) { refs[first].current?.focus(); return; }
    setIsSubmitting(true);
    try {
      const result = await register({ name: name.trim(), email: email.trim(), password });
      if (result.error) {
        const duplicate = /already registered/i.test(result.error);
        setNotice(duplicate
          ? 'That username or email already has an account. Log in, or use Continue with Google if you registered with Google.'
          : result.error);
        return;
      }
      setNotice('Account created. You are now signed in.');
      setActiveTab('campaign');
    } catch (error) {
      setNotice(error.message || 'Account creation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldProps = (field) => ({
    'aria-invalid': Boolean(errors[field]),
    'aria-describedby': errors[field] ? `${field}-error` : undefined,
    onBlur: () => setErrors((current) => ({ ...current, [field]: validateSignup(values)[field] }))
  });

  return <main className="auth-page">
    <section className="auth-card signup-card" aria-labelledby="signup-heading">
      <h1 id="signup-heading">Signup</h1>
      <p className="auth-intro">Create Account</p>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="signup-name">Username</label>
        <div className="auth-input-wrap"><input ref={nameRef} id="signup-name" type="text" autoComplete="username" placeholder="Choose a username" value={name} onChange={(event) => handleChange('name', event.target.value, setName)} {...fieldProps('name')} /></div>
        {errors.name && <p id="name-error" className="field-error auth-field-error" role="alert">{errors.name}</p>}

        <label htmlFor="signup-email">Email</label>
        <div className="auth-input-wrap"><input ref={emailRef} id="signup-email" type="email" autoComplete="email" placeholder="Enter your email" value={email} onChange={(event) => handleChange('email', event.target.value, setEmail)} {...fieldProps('email')} /></div>
        {errors.email && <p id="email-error" className="field-error auth-field-error" role="alert">{errors.email}</p>}

        <label htmlFor="signup-password">Password</label>
        <div className="auth-input-wrap"><input ref={passwordRef} id="signup-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Create a password" value={password} onChange={(event) => handleChange('password', event.target.value, setPassword)} {...fieldProps('password')} /><button type="button" className="password-toggle" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
        <p className="auth-password-hint">Use at least 8 characters, including a letter and a number.</p>
        {errors.password && <p id="password-error" className="field-error auth-field-error" role="alert">{errors.password}</p>}

        <label htmlFor="signup-confirm-password">Confirm password</label>
        <div className="auth-input-wrap"><input ref={confirmRef} id="signup-confirm-password" type="password" autoComplete="new-password" placeholder="Confirm your password" value={confirmPassword} onChange={(event) => handleChange('confirmPassword', event.target.value, setConfirmPassword)} {...fieldProps('confirmPassword')} /></div>
        {errors.confirmPassword && <p id="confirmPassword-error" className="field-error auth-field-error" role="alert">{errors.confirmPassword}</p>}

        <button className="auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating account…' : 'Sign Up'}</button>
      </form>
      {notice && <p className="auth-notice" role="status">{notice}</p>}

      <div className="auth-divider"><span>OR</span></div>
      <div className="google-login-wrap"><GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setNotice('Google sign-in did not complete. Confirm this site is an authorized Google OAuth origin and try again.')} text="continue_with" theme="outline" shape="pill" size="large" width={googleButtonWidth} use_fedcm_for_button={false} /></div>
      <p className="auth-switch">Already have an account? <button className="auth-text-button" type="button" onClick={() => setActiveTab('login')}>Login</button></p>
    </section>
  </main>;
};

export default SignupPage;
