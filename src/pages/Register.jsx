import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({ name, email, password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="card-container w-full max-w-md">
        <h1 className="text-2xl font-bold text-white text-center mb-6">Create an Account</h1>
        
        {error && <div className="bg-danger/20 text-danger p-3 rounded mb-4 text-sm">{error}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-1">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe" 
              className="input-field" 
              required
            />
          </div>
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
          
          <button type="submit" className="btn-primary w-full mt-6">Sign Up</button>
        </form>
        
        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account? <Link to="/login" className="text-primary hover:text-primaryHover">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
