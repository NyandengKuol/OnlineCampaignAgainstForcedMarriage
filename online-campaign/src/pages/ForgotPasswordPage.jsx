import { useState } from 'react';
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react';
import { confirmPasswordReset, requestPasswordReset } from '../utils/storage';
import { emailPattern } from '../utils/validators';
import './AuthPages.css';

const ForgotPasswordPage = ({ setActiveTab }) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [stage, setStage] = useState('request');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const sendCode = async (event) => {
    event.preventDefault();
    if (!emailPattern.test(email.trim())) { setError('Enter a valid email address.'); return; }
    setBusy(true); setError(''); setMessage('');
    try {
      const result = await requestPasswordReset(email.trim());
      setEmail(email.trim()); setStage('reset'); setMessage(result.message);
    } catch (requestError) { setError(requestError.message || 'Could not send a reset code.'); }
    finally { setBusy(false); }
  };

  const reset = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) { setError('Enter the 6-digit code from your email.'); return; }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) { setError('Use at least 8 characters with a letter and a number.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setBusy(true); setError(''); setMessage('');
    try {
      const result = await confirmPasswordReset(email, code.trim(), password);
      setMessage(result.message); setStage('complete');
    } catch (resetError) { setError(resetError.message || 'Could not reset your password.'); }
    finally { setBusy(false); }
  };

  return <main className="auth-page"><section className="auth-card reset-card" aria-labelledby="reset-heading">
    <button type="button" className="auth-back-button" onClick={() => setActiveTab('login')}><ArrowLeft size={16} /> Back to login</button>
    {stage === 'request' ? <><Mail className="auth-flow-icon" size={27} /><h1 id="reset-heading">Forgot password?</h1><p className="auth-intro">Enter your email and we will send a 6-digit reset code.</p><form className="auth-form" onSubmit={sendCode} noValidate><label htmlFor="reset-email">Email address</label><div className="auth-input-wrap"><input id="reset-email" type="email" autoComplete="email" placeholder="Enter your email address" value={email} onChange={(event) => setEmail(event.target.value)} /></div><button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Sending code…' : 'Send reset code'}</button></form></> : stage === 'reset' ? <><ShieldCheck className="auth-flow-icon" size={27} /><h1 id="reset-heading">Reset your password</h1><p className="auth-intro">Enter the code sent to <strong>{email}</strong>, then choose a new password.</p><form className="auth-form" onSubmit={reset} noValidate><label htmlFor="reset-code">6-digit code</label><div className="auth-input-wrap"><input id="reset-code" inputMode="numeric" autoComplete="one-time-code" maxLength="6" placeholder="000000" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} /></div><label htmlFor="reset-password">New password</label><div className="auth-input-wrap"><input id="reset-password" type="password" autoComplete="new-password" placeholder="Create a new password" value={password} onChange={(event) => setPassword(event.target.value)} /></div><p className="auth-password-hint">Use at least 8 characters, including a letter and a number.</p><label htmlFor="reset-confirm-password">Confirm new password</label><div className="auth-input-wrap"><input id="reset-confirm-password" type="password" autoComplete="new-password" placeholder="Confirm your new password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></div><button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Resetting password…' : 'Reset password'}</button></form><button type="button" className="auth-text-button reset-resend" onClick={sendCode} disabled={busy}>Send a new code</button></> : <><ShieldCheck className="auth-flow-icon auth-flow-success" size={30} /><h1 id="reset-heading">Password reset</h1><p className="auth-intro">Your password was changed successfully. You can now sign in with your new password.</p><button className="auth-submit" type="button" onClick={() => setActiveTab('login')}>Go to login</button></>}
    {message && stage !== 'complete' && <p className="auth-notice" role="status">{message}</p>}
    {error && <p className="auth-notice auth-notice-error" role="alert">{error}</p>}
  </section></main>;
};

export default ForgotPasswordPage;
