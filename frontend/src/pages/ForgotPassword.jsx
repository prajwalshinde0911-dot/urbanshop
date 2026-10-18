import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPasswordRequest } from '../api/auth';
import { useToast } from '../context/ToastContext';

function ForgotPassword() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await forgotPasswordRequest(email);
      setSent(true);
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Forgot password</h1>
        {sent ? (
          <p className="auth-sub">
            If an account exists for {email}, a reset link has been sent. Check your inbox.
          </p>
        ) : (
          <>
            <p className="auth-sub">Enter your email and we'll send you a reset link.</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <button className="btn-primary" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
          </>
        )}
        <p className="auth-links"><Link to="/login">Back to login</Link></p>
      </div>
    </div>
  );
}

export default ForgotPassword;