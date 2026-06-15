import { useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      login(token);
    } else {
      navigate('/login');
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 font-medium tracking-wide">Authenticating securely...</p>
      </div>
    </div>
  );
};

export default AuthSuccess;
