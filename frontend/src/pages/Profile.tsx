import React from 'react';

const Profile: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">User profile information will be displayed here.</p>
      </div>
    </div>
  );
};

export default Profile;