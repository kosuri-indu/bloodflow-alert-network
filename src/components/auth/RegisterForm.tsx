
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bloodType: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual registration logic when backend is ready
    console.log('Registration attempt:', formData);
    navigate('/login');
  };

  return (
    <Card className="w-full max-w-md p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600">Create Account</h2>
        <p className="text-gray-600">Join the BloodFlowAI donation community</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        
        <Input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        
        <Input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        
        <Select
          onValueChange={(value) => setFormData({ ...formData, bloodType: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Blood Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A+">A+</SelectItem>
            <SelectItem value="A-">A-</SelectItem>
            <SelectItem value="B+">B+</SelectItem>
            <SelectItem value="B-">B-</SelectItem>
            <SelectItem value="AB+">AB+</SelectItem>
            <SelectItem value="AB-">AB-</SelectItem>
            <SelectItem value="O+">O+</SelectItem>
            <SelectItem value="O-">O-</SelectItem>
          </SelectContent>
        </Select>

        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
          Register
        </Button>
      </form>
      
      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <button
          onClick={() => navigate('/login')}
          className="text-red-600 hover:text-red-700"
        >
          Login here
        </button>
      </p>
    </Card>
  );
};

export default RegisterForm;
