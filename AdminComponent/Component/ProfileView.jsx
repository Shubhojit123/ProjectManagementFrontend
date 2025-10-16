import React from 'react';
import { User, Shield, Crown, ArrowLeft, MapPin, Calendar } from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from 'react-router-dom';

function ProfileView() {
  const {profileViews} = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const {id} = useParams()

  const { data: profileData, loading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await profileViews(id);
      return res.data;
    },
  });

  const getRoleConfig = (role) => {
    switch (role) {
      case 'Admin':
        return {
          icon: <Crown className="w-6 h-6" />,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/10',
          borderColor: 'border-yellow-400/20',
          title: 'Administrator'
        };
      case 'Manager':
        return {
          icon: <Shield className="w-6 h-6" />,
          color: 'text-blue-400',
          bgColor: 'bg-blue-400/10',
          borderColor: 'border-blue-400/20',
          title: 'Manager'
        };
      default:
        return {
          icon: <User className="w-6 h-6" />,
          color: 'text-green-400',
          bgColor: 'bg-green-400/10',
          borderColor: 'border-green-400/20',
          title: 'Team Member'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="mb-4">Profile not found</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const roleConfig = getRoleConfig(profileData.role);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Profile Card */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
          {/* Profile Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <img
                src={profileData.profileImage}
                alt={profileData.username}
                className="w-24 h-24 rounded-full border-4 border-gray-600 mx-auto"
              />
              <div className={`absolute -bottom-2 -right-2 p-2 rounded-full ${roleConfig.bgColor} ${roleConfig.borderColor} border-2`}>
                <div className={roleConfig.color}>
                  {roleConfig.icon}
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold mb-2">{profileData.username}</h1>
            
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${roleConfig.bgColor} ${roleConfig.color} border ${roleConfig.borderColor}`}>
                {roleConfig.title}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs ${profileData.userStatus ? 'bg-green-400/10 text-green-400 border border-green-400/20' : 'bg-red-400/10 text-red-400 border border-red-400/20'}`}>
                {profileData.userStatus ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">Role</span>
              <span className="text-white font-medium">{profileData.role}</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">Status</span>
              <span className={`font-medium ${profileData.userStatus ? 'text-green-400' : 'text-red-400'}`}>
                {profileData.userStatus ? 'Active' : 'Inactive'}
              </span>
            </div>

           {profileData.role === 'Manager' && (
             <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">Projects</span>
              <span className="text-white font-medium">{profileData.projectDetails?.length || 0}</span>
            </div>
           )}

            {profileData.role === 'Manager' && (
              <div className="flex items-center justify-between py-3 border-b border-gray-700">
                <span className="text-gray-400">Team Members</span>
                <span className="text-white font-medium">{profileData.assignUserList?.length || 0}</span>
              </div>
            )}

            {profileData.manager && profileData.role !== 'Admin' && (
              <div className="flex items-center justify-between py-3 border-b border-gray-700">
                <span className="text-gray-400">Manager</span>
                <div className="flex items-center gap-2">
                  <img
                    src={profileData.manager.profileImage}
                    alt={profileData.manager.username}
                    className="w-6 h-6 rounded-full border border-gray-600"
                  />
                  <span className="text-white font-medium">{profileData.manager.username}</span>
                </div>
              </div>
            )}
          </div>

          {profileData.role === "Manager" && (
  <div
    className={`text-center p-4 rounded-lg ${roleConfig.bgColor} border ${roleConfig.borderColor}`}
  >
    <div className={`text-2xl font-bold ${roleConfig.color} mb-1`}>
      {profileData.projectDetails?.length || 0}
    </div>
    <div className="text-sm text-gray-400">Projects</div>
  </div>
)}

            
            <div className="text-center p-4 bg-gray-700/30 rounded-lg border border-gray-600">
              <div className="text-2xl font-bold text-gray-300 mb-1">
                {profileData.role === 'Manager' ? profileData.assignUserList?.length || 0 : 
                 profileData.role === 'Admin' ? 'Admin' : 'Member'}
              </div>
              <div className="text-sm text-gray-400">
                {profileData.role === 'Manager' ? 'Team Size' : 
                 profileData.role === 'Admin' ? 'Level' : 'Role'}
              </div>
            </div>
          </div>
        </div>

      </div>
  );
}

export default ProfileView;