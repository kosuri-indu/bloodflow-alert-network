
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import HospitalLoginForm from '../components/auth/HospitalLoginForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'donor' | 'hospital'>('donor');
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center">
            <Brain className="h-10 w-10 text-purple-600" />
          </div>
          <h1 className="mt-2 text-2xl font-bold">
            BloodBank<span className="text-purple-600">AI</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            AI-powered blood donation matching platform
          </p>
        </div>
        <Tabs 
          defaultValue="donor" 
          className="w-full"
          onValueChange={(value) => setActiveTab(value as 'donor' | 'hospital')}
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="donor">Donor Login</TabsTrigger>
            <TabsTrigger value="hospital">Hospital Login</TabsTrigger>
          </TabsList>
          <TabsContent value="donor">
            <LoginForm />
          </TabsContent>
          <TabsContent value="hospital">
            <HospitalLoginForm />
          </TabsContent>
        </Tabs>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={() => navigate('/register')}
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
