import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ApiCredentialsModal from '../components/ApiCredentialsModal';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Key, User, Shield, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Settings = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  const handleAddInputClick = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/settings' } } });
      return;
    }
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    
  };

  const handleRemoveApiCredentials = async () => {
    if (!user?.id) {
      console.error('No user ID available');
      return;
    }

    try {
      // Update the profile to remove API credentials
      const { error } = await supabase
        .from('profiles')
        .update({ 
          api_key: null, 
          api_secret: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error removing API credentials:', error);
        return;
      }

      
      
      // Refresh the page to update the UI
      window.location.reload();
      
    } catch (error) {
      console.error('Error in handleRemoveApiCredentials:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <SettingsIcon className="h-8 w-8 text-gray-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-lg text-gray-600">Manage your account and API preferences</p>
            </div>
          </div>
          {user && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                Welcome, <span className="font-semibold">{getUserDisplayName()}</span>! 
                Configure your trading analytics settings below.
              </p>
            </div>
          )}
        </div>

        {/* API Credentials Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Key className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  API Credentials
                </h2>
                <p className="text-sm text-gray-600">
                  Add your exchange API credentials to fetch live trading data
                </p>
              </div>
            </div>
            {profile?.api_key ? (
              <Button 
                onClick={handleRemoveApiCredentials}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            ) : (
              <Button onClick={() => setIsModalOpen(true)}>
                + Add API Key
              </Button>
            )}
          </div>
          
          {profile?.api_key && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="space-y-2">
                <p className="text-green-800 text-sm font-medium">
                  ✓ API credentials configured
                </p>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>API Key:</span>
                    <span className="font-mono">{profile.api_key.substring(0, 5)}••••••••••••••••</span>
                  </div>
                  <div className="flex justify-between">
                    <span>API Secret:</span>
                    <span className="font-mono">{profile.api_secret?.substring(0, 5)}••••••••••••••••</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Account Information Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 mb-8">
          <div className="flex items-center mb-6">
            <User className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Account Information
              </h2>
              <p className="text-sm text-gray-600">
                Your account details and preferences
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Name</span>
              <span className="font-medium">{getUserDisplayName()}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600">Account Created</span>
              <span className="font-medium">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 mb-8">
          <div className="flex items-center mb-6">
            <Shield className="h-6 w-6 text-red-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Security
              </h2>
              <p className="text-sm text-gray-600">
                Manage your account security settings
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <div>
                <span className="text-gray-900 font-medium">Change Password</span>
                <p className="text-sm text-gray-600">Update your account password</p>
              </div>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>
            <div className="flex justify-between items-center py-3">
              <div>
                <span className="text-gray-900 font-medium">Two-Factor Authentication</span>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
              <Button variant="outline" size="sm">
                Enable
              </Button>
            </div>
          </div>
        </div>

        {/* API Credentials Modal */}
        <ApiCredentialsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      </div>
    </div>
  );
};

export default Settings; 