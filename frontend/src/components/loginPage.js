import { useState } from 'react';
import axiosInstance from '../api/axiosConfig';
import { saveToken } from '../api/authService';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axiosInstance.post('/api/auth/login/', { email, password });
      saveToken(res.data.access, res.data.refresh);
      navigate('/dashboard');
    } catch (err) {
      setError('Identifiants incorrects');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Connexion</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /><br /><br />
      <input placeholder="Mot de passe" type="password" value={password} onChange={e => setPassword(e.target.value)} /><br /><br />
      <button onClick={handleLogin}>Se connecter</button>
    </div>
  );
}

export default LoginPage;