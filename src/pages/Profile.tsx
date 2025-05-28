import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; // adjust path as needed
import {
  User,
  Mail,
  Building,
  Phone,
  MapPin,
  Shield,
  Edit3
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

interface DBUser {
  id: number;
  name: string;
  email: string;
  role: 'Transporter' | 'Logistics Company' | 'Certifier' | 'Admin';
  status: 'active' | 'pending' | 'suspended';
  credits: number;
  join_date: string;
  avatar_url?: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<DBUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) return;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', authUser.email)
        .single();

      if (error) {
        console.error('Failed to fetch user:', error);
        return;
      }

      setUser(data);
    };

    fetchUser();
  }, []);

  if (!user) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-secondary-900">Profile</h1>
        <p className="mt-1 text-secondary-500">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <div className="flex flex-col items-center pb-6">
              <div className="relative">
                <img
                  src={user.avatar_url || 'https://via.placeholder.com/150'}
                  alt={user.name}
                  className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md"
                />
                <button className="absolute bottom-0 right-0 p-1 bg-primary-500 rounded-full text-white shadow-md">
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>

              <h2 className="mt-4 text-xl font-semibold text-secondary-900">
                {user.name}
              </h2>

              <p className="text-secondary-500">{user.role}</p>

              <div className="mt-4 flex items-center bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm">
                <Building className="h-4 w-4 mr-1" />
                {user.status}
              </div>

              <div className="mt-6 w-full">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>
            </div>

            <div className="pt-6 border-t border-secondary-100">
              <h3 className="text-sm font-medium text-secondary-900 mb-4">
                Contact Information
              </h3>
              <div className="space-y-3 text-sm text-secondary-700">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-secondary-500 mr-3" />
                  <span>{user.email}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-secondary-100">
              <h3 className="text-sm font-medium text-secondary-900 mb-4">
                Account Information
              </h3>
              <div className="space-y-3 text-sm text-secondary-700">
                <div className="flex justify-between">
                  <span className="text-secondary-500">Member since</span>
                  <span>
                    {new Date(user.join_date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-secondary-500">Account ID</span>
                  <span>{user.id}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-secondary-900">
                {isEditing ? 'Edit Profile Information' : 'Profile Information'}
              </h3>

              {isEditing && (
                <Button variant="primary">Save Changes</Button>
              )}
            </div>

            <div className="space-y-6">
              {isEditing ? (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-secondary-700">
                        Name
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={user.name}
                        disabled
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-secondary-700">
                        Email
                      </label>
                      <input
                        type="email"
                        className="input"
                        value={user.email}
                        disabled
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-secondary-700">
                        Role
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={user.role}
                        disabled
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-secondary-500">Name</p>
                    <p className="text-secondary-900 font-medium">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-secondary-500">Email</p>
                    <p className="text-secondary-900 font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-secondary-500">Role</p>
                    <p className="text-secondary-900 font-medium">{user.role}</p>
                  </div>
                  <div>
                    <p className="text-secondary-500">Status</p>
                    <p className="text-secondary-900 font-medium">{user.status}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center mb-4">
              <Shield className="h-5 w-5 text-primary-600 mr-2" />
              <h3 className="text-lg font-medium text-secondary-900">
                Account Security
              </h3>
            </div>

            <div className="space-y-4">
              <Button variant="outline" className="w-full md:w-auto">
                Change Password
              </Button>

              <div className="pt-4 border-t border-secondary-100">
                <h4 className="text-sm font-medium text-secondary-700 mb-2">
                  Two-Factor Authentication
                </h4>
                <p className="text-sm text-secondary-500 mb-2">
                  Add an extra layer of security to your account
                </p>
                <Button variant="secondary">Enable 2FA</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
