// Auth.js
import React, { useState } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

const Auth = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin(auth.currentUser);  // Pass the authenticated user to the parent
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    onLogin(null);  // Clear the logged-in user
  };

  return (
    <div className="auth-container">
      <h2>{isSignUp ? 'Sign Up' : 'Login'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleAuth}>
        {isSignUp ? 'Sign Up' : 'Login'}
      </button>
      <p>
        {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
        <span onClick={() => setIsSignUp(!isSignUp)} style={{ color: 'blue', cursor: 'pointer' }}>
          {isSignUp ? 'Login' : 'Sign Up'}
        </span>
      </p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Auth;
