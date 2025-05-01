
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import { Brain } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center">
            <Brain className="h-10 w-10 text-purple-600" />
          </div>
          <h1 className="mt-2 text-2xl font-bold">
            BloodMatch<span className="text-purple-600">AI</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            AI-powered blood donation matching platform
          </p>
        </div>
        <RegisterForm />
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => navigate('/login')}
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
