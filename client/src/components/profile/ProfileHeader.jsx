import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { FiUser, FiEdit2, FiCamera } from 'react-icons/fi';
import userService from '../../api/userService';
import { toast } from 'react-toastify';
import Loader from '../common/Loader';

const ProfileHeader = ({ user, onProfileUpdate }) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await userService.updateProfile(profileData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      
      // Call the parent component's callback to update user data
      if (onProfileUpdate) {
        onProfileUpdate(response.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    setUploadLoading(true);
    
    try {
      const response = await userService.uploadProfileImage(file);
      
      // Update the profile data with the new avatar URL
      setProfileData({
        ...profileData,
        avatar: response.data.avatar
      });
      
      // Call the parent component's callback to update user data
      if (onProfileUpdate) {
        onProfileUpdate({
          ...user,
          avatar: response.data.avatar
        });
      }
      
      toast.success('Profile image updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload profile image');
    } finally {
      setUploadLoading(false);
    }
  };
  
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'vendor':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };
  
  if (!user) return <Loader />;
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      {loading && <Loader />}
      
      {/* Hidden file input for avatar upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start space-x-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {uploadLoading ? (
                  <div className="flex items-center justify-center w-full h-full">
                    <div className="w-6 h-6 border-2 border-t-2 border-gray-500 border-t-blue-500 rounded-full animate-spin"></div>
                  </div>
                ) : profileData.avatar.url ? (
                  <img
                    src={profileData.avatar.url}
                    alt={profileData.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FiUser className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <button
                type="button"
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1 rounded-full"
                title="Upload avatar"
                disabled={uploadLoading}
              >
                <FiCamera className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex-1">
              <div className="mb-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profileData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-start space-x-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {uploadLoading ? (
                <div className="flex items-center justify-center w-full h-full">
                  <div className="w-6 h-6 border-2 border-t-2 border-gray-500 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              ) : user?.avatar?.url ? (
                <img
                  src={user?.avatar?.url}
                  alt={user?.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <FiUser className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <button
              onClick={handleAvatarClick}
              className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1 rounded-full"
              title="Upload avatar"
              disabled={uploadLoading}
            >
              <FiCamera className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-500 mr-3">{user?.email}</span>
                  <span className={`text-xs px-2 py-1 rounded-full capitalize ${getRoleBadgeColor(user.role)}`}>
                    {user?.role}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                title="Edit Profile"
              >
                <FiEdit2 className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            
            <div className="mt-2">
              {user?.phone && (
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Phone:</span> {user?.phone}
                </p>
              )}
              <p className="text-sm text-gray-500">
                <span className="font-medium">Member since:</span> {new Date(user?.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader; 