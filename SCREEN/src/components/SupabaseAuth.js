import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SupabaseAuth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    const session = supabase.auth.getSession();
    const user = session?.user;
    setUser(user);

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      // Clean up the subscription
      if (authListener) authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // If sign up successful, store additional user data in the users table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              username,
              email,
              created_at: new Date(),
            },
          ]);

        if (profileError) throw profileError;
        
        setMessage('Sign up successful! Please check your email for verification.');
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      setMessage('Sign in successful!');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setMessage('Signed out successfully');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Supabase Authentication</h2>
      
      {message && <div className="message">{message}</div>}
      
      {user ? (
        <div className="user-info">
          <h3>Welcome, {user.email}</h3>
          <button onClick={handleSignOut} disabled={loading}>
            {loading ? 'Loading...' : 'Sign Out'}
          </button>
        </div>
      ) : (
        <div className="auth-forms">
          <form onSubmit={handleSignUp} className="auth-form">
            <h3>Sign Up</h3>
            <div className="form-group">
              <label htmlFor="signup-username">Username</label>
              <input
                id="signup-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Sign Up'}
            </button>
          </form>

          <form onSubmit={handleSignIn} className="auth-form">
            <h3>Sign In</h3>
            <div className="form-group">
              <label htmlFor="signin-email">Email</label>
              <input
                id="signin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="signin-password">Password</label>
              <input
                id="signin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Sign In'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SupabaseAuth;
