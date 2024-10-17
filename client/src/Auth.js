// Auth.js
import React, { useState } from 'react';
import { auth } from './firebase';  // Firebase auth
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

const Auth = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);  // Loading state for feedback

  // Handle login or signup
  const handleAuth = async () => {
    setError('');
    setLoading(true);  // Start loading state
    try {
      if (isSignUp) {
        // Sign up new user
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // Log in existing user
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin(auth.currentUser);  // Call the parent component's login handler
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);  // Stop loading state
  };

  // Handle logout (optional)
  const handleLogout = async () => {
    await signOut(auth);
    onLogin(null);
  };

  // Form validation for basic email and password requirements
  const isValidForm = () => {
    return email.length > 0 && password.length >= 6;
  };

  return (
    <div className="auth-container">
      <h2>{isSignUp ? 'Sign Up' : 'Login'}</h2>
      {error && <p className="error-message">{error}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password (min 6 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
      />
      <button onClick={handleAuth} disabled={!isValidForm() || loading}>
        {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Login'}
      </button>
      <p>
        {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
        <span onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? 'Login' : 'Sign Up'}
        </span>
      </p>
    </div>
  );
};

export default Auth;