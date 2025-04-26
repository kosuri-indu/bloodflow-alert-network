
import { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import HospitalLoginForm from '../components/auth/HospitalLoginForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState<'donor' | 'hospital'>('donor');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
      </div>
    </div>
  );
};

export default LoginPage;
