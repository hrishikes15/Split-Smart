import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="card-container w-full max-w-md">
        <h1 className="text-2xl font-bold text-white text-center mb-6">Log in to SplitSmart</h1>
        
        {error && <div className="bg-danger/20 text-danger p-3 rounded mb-4 text-sm">{error}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" 
              className="input-field" 
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="input-field" 
              required
            />
          </div>
          
          <button type="submit" className="btn-primary w-full mt-6">Log In</button>
        </form>
        
        <p className="text-center text-gray-400 text-sm mt-6">
          Don't have an account? <Link to="/register" className="text-primary hover:text-primaryHover">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
