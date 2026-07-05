import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Login = ({ setView }) => {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Invalid credentials');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Login to manage your daily tasks</p>
        </div>

        {error && (
          <div className="error-message">
            <i className="bx bx-error-circle" style={{ fontSize: '1.1rem' }}></i> {error}
          </div>
        )}

        <form className="auth-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              placeholder="name@example.com"
              value={email}
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={onChange}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="auth-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div>
            Don't have an account?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); setView('register'); }}>
              Register here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
