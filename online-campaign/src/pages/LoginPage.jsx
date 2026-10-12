import { useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { validateLogin } from '../utils/validators';
import './AuthPages.css';

const LoginPage = ({ setActiveTab }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');
  const identifierRef = useRef(null);
  const passwordRef = useRef(null);
  const { login, googleLogin } = useAuth();
  const googleButtonWidth = Math.min(400, Math.max(220, window.innerWidth - 56));

  const handleGoogleSuccess = async ({ credential } = {}) => {
    if (!credential) {
      setNotice('Google did not return a sign-in credential. Check the Google OAuth client configuration.');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await googleLogin(credential);
      if (result.error) { setNotice(result.error); return; }
      setNotice('Signed in successfully.');
      setActiveTab(result.user.isAdmin ? 'admin' : 'dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const next = validateLogin({ email: identifier, password });
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      (first === 'email' ? identifierRef : passwordRef).current?.focus();
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await login({ identifier, password, rememberMe });
      if (result.error) { setNotice(result.error); return; }
      setNotice('Signed in successfully.');
      setActiveTab(result.user.isAdmin ? 'admin' : 'dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validationValues = { email: identifier, password };
  const fieldProps = (name) => ({
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
    onBlur: () => setErrors((current) => ({ ...current, [name]: validateLogin(validationValues)[name] }))
  });

  return <main className="auth-page">
    <section className="auth-card login-card" aria-labelledby="login-heading">
      <h1 id="login-heading">Login</h1>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="login-identifier">Username or email</label>
        <div className="auth-input-wrap"><input ref={identifierRef} id="login-identifier" type="text" autoComplete="username" placeholder="Enter your username or email" value={identifier} onChange={(event) => { setIdentifier(event.target.value); setErrors((current) => ({ ...current, email: '' })); setNotice(''); }} {...fieldProps('email')} /></div>
        {errors.email && <p id="email-error" className="field-error auth-field-error" role="alert">{errors.email}</p>}

        <label htmlFor="login-password">Password</label>
        <div className="auth-input-wrap"><input ref={passwordRef} id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => { setPassword(event.target.value); setErrors((current) => ({ ...current, password: '' })); setNotice(''); }} {...fieldProps('password')} /><button type="button" className="password-toggle" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
        {errors.password && <p id="password-error" className="field-error auth-field-error" role="alert">{errors.password}</p>}

        <div className="login-options"><label className="remember-row"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /> Remember me</label><button className="auth-text-button" type="button" onClick={() => setNotice('Password reset is not available yet. Please contact the campaign team for help.')}>Forgot password?</button></div>
        <button className="auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Signing in…' : 'Sign In'}</button>
      </form>

      <div className="auth-divider"><span>OR</span></div>
      <div className="google-login-wrap"><GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setNotice('Google sign-in did not complete. Confirm this site is an authorized Google OAuth origin and try again.')} text="continue_with" theme="outline" shape="pill" size="large" width={googleButtonWidth} /></div>
      {notice && <p className="auth-notice" role="status">{notice}</p>}
      <p className="auth-switch">Don’t have an account? <button className="auth-text-button" type="button" onClick={() => setActiveTab('signup')}>Sign up</button></p>
      <p className="auth-legal">Privacy Policy · Terms of Service</p>
    </section>
  </main>;
};

export default LoginPage;
