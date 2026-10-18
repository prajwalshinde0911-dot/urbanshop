import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resetPasswordRequest } from '../api/auth';
import { useToast } from '../context/ToastContext';

function ResetPassword() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const token = new URLSearchParams(window.location.hash.replace('#', '')).get('access_token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await resetPasswordRequest(token, password);
      showToast('Password updated. Please log in.');
      navigate('/login');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Could not reset password', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Set a new password</h1>
        {!token ? (
          <>
            <p className="auth-sub">This reset link is invalid or has expired.</p>
            <p className="auth-links"><Link to="/forgot-password">Request a new link</Link></p>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>New password (min 6 characters)</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
            </div>
            <button className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;