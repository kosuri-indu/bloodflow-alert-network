
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Hospital, Heart, Briefcase } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HospitalRegisterForm from '../components/auth/HospitalRegisterForm';
import DonorRegisterForm from '../components/auth/DonorRegisterForm';
import HospitalLoginForm from '../components/auth/HospitalLoginForm';
import DonorLoginForm from '../components/auth/DonorLoginForm';

type UserTypeSelection = 'hospital' | 'donor' | 'government';

const UnifiedRegisterPage = () => {
  const navigate = useNavigate();
  const [selectedUserType, setSelectedUserType] = useState<UserTypeSelection>('hospital');
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('register');

  const getUserTypeIcon = (type: UserTypeSelection) => {
    switch (type) {
      case 'hospital': return <Hospital className="h-8 w-8 text-red-600" />;
      case 'donor': return <Heart className="h-8 w-8 text-red-600" />;
      case 'government': return <Briefcase className="h-8 w-8 text-blue-600" />;
    }
  };

  const getUserTypeColor = (type: UserTypeSelection) => {
    switch (type) {
      case 'hospital': return 'border-red-200 bg-red-50';
      case 'donor': return 'border-red-200 bg-red-50';
      case 'government': return 'border-blue-200 bg-blue-50';
    }
  };

  const handleGovernmentAccess = () => {
    navigate('/gov-login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2">
            <Brain className="h-10 w-10 text-purple-600" />
            <Hospital className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="mt-2 text-3xl font-bold">
            BloodBank<span className="text-purple-600">AI</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Hospital Blood Bank Network & AI Matching System
          </p>
        </div>

        {/* User Type Selection */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-center">Choose Your Role</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setSelectedUserType('hospital')}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                selectedUserType === 'hospital' 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <Hospital className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <h3 className="font-semibold">Hospital</h3>
              <p className="text-sm text-gray-600">Blood bank management</p>
            </button>

            <button
              onClick={() => setSelectedUserType('donor')}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                selectedUserType === 'donor' 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <h3 className="font-semibold">Donor</h3>
              <p className="text-sm text-gray-600">Save lives by donating</p>
            </button>

            <button
              onClick={handleGovernmentAccess}
              className="p-4 border-2 border-blue-200 rounded-lg text-center transition-all hover:border-blue-300 hover:bg-blue-50"
            >
              <Briefcase className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold">Government</h3>
              <p className="text-sm text-gray-600">Official oversight</p>
            </button>
          </div>
        </Card>

        {/* Forms for Hospital and Donor */}
        {selectedUserType !== 'government' && (
          <Card className="p-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="register">
                  {selectedUserType === 'hospital' ? 'Hospital Signup' : 'Donor Signup'}
                </TabsTrigger>
                <TabsTrigger value="login">
                  {selectedUserType === 'hospital' ? 'Hospital Login' : 'Donor Login'}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="register">
                <div className="flex items-center justify-center gap-2 mb-6">
                  {getUserTypeIcon(selectedUserType)}
                  <h2 className="text-xl font-bold">
                    {selectedUserType === 'hospital' ? 'Hospital Registration' : 'Donor Registration'}
                  </h2>
                </div>
                {selectedUserType === 'hospital' ? <HospitalRegisterForm /> : <DonorRegisterForm />}
              </TabsContent>

              <TabsContent value="login">
                <div className="flex items-center justify-center gap-2 mb-6">
                  {getUserTypeIcon(selectedUserType)}
                  <h2 className="text-xl font-bold">
                    {selectedUserType === 'hospital' ? 'Hospital Login' : 'Donor Login'}
                  </h2>
                </div>
                {selectedUserType === 'hospital' ? <HospitalLoginForm /> : <DonorLoginForm />}
              </TabsContent>
            </Tabs>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UnifiedRegisterPage;
