
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual login logic when backend is ready
    console.log('Login attempt:', formData);
    navigate('/dashboard');
  };

  return (
    <Card className="w-full max-w-md p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600">Welcome Back</h2>
        <p className="text-gray-600">Login to your BloodFlowAI account</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>
        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
          Login
        </Button>
      </form>
      
      <p className="text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <button
          onClick={() => navigate('/register')}
          className="text-red-600 hover:text-red-700"
        >
          Register here
        </button>
      </p>
    </Card>
  );
};

export default LoginForm;
