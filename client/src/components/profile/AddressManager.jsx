import { useState } from 'react';
import { FiHome, FiPlus, FiEdit2, FiTrash2, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import userService from '../../api/userService';
import Loader from '../common/Loader';

const AddressManager = ({ addresses = [], onAddressUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    isDefault: false
  });
  
  const handleAddNewClick = () => {
    setFormData({
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      isDefault: false
    });
    setIsAdding(true);
    setIsEditing(false);
  };
  
  const handleEditClick = (address) => {
    setCurrentAddress(address);
    setFormData({
      addressId: address._id,
      street: address.street,
      city: address.city,
      state: address.state,
      country: address.country,
      zipCode: address.zipCode,
      isDefault: address.isDefault
    });
    setIsEditing(true);
    setIsAdding(false);
  };
  
  const handleDeleteClick = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await userService.deleteAddress(addressId);
      toast.success('Address deleted successfully');
      
      // Call the parent component's callback to update addresses
      if (onAddressUpdate) {
        onAddressUpdate(response.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete address');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await userService.updateAddress(formData);
      toast.success(isAdding ? 'Address added successfully' : 'Address updated successfully');
      setIsAdding(false);
      setIsEditing(false);
      
      // Call the parent component's callback to update addresses
      if (onAddressUpdate) {
        onAddressUpdate(response.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };
  
  const AddressForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4 border rounded-md p-4 bg-gray-50">
      <h3 className="text-lg font-medium text-gray-900">
        {isAdding ? 'Add New Address' : 'Edit Address'}
      </h3>
      
      <div>
        <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
          Street Address *
        </label>
        <input
          type="text"
          id="street"
          name="street"
          value={formData.street}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
            State/Province *
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            Country *
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
            Zip/Postal Code *
          </label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isDefault"
          name="isDefault"
          checked={formData.isDefault}
          onChange={handleChange}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
          Set as default address
        </label>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => {
            setIsAdding(false);
            setIsEditing(false);
          }}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
        >
          {isAdding ? 'Add Address' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      {loading && <Loader />}
      
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">My Addresses</h2>
        
        {!isAdding && !isEditing && (
          <button
            onClick={handleAddNewClick}
            className="flex items-center px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none"
          >
            <FiPlus className="mr-1 h-4 w-4" />
            Add New
          </button>
        )}
      </div>
      
      {isAdding || isEditing ? (
        <AddressForm />
      ) : addresses.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-md">
          <FiHome className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No addresses</h3>
          <p className="mt-1 text-sm text-gray-500">Add your first address to speed up checkout.</p>
          <div className="mt-6">
            <button
              onClick={handleAddNewClick}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
            >
              <FiPlus className="-ml-1 mr-2 h-5 w-5" />
              Add New Address
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address._id}
              className={`border rounded-md p-4 ${address.isDefault ? 'border-indigo-500 bg-indigo-50' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <h3 className="text-md font-medium text-gray-900">
                      {address.street}
                    </h3>
                    {address.isDefault && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        <FiCheck className="mr-1 h-3 w-3" />
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {address.city}, {address.state} {address.zipCode}
                  </p>
                  <p className="text-sm text-gray-500">
                    {address.country}
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditClick(address)}
                    className="p-1 text-gray-500 hover:text-indigo-600"
                    title="Edit Address"
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                  {!address.isDefault && (
                    <button
                      onClick={() => handleDeleteClick(address._id)}
                      className="p-1 text-gray-500 hover:text-red-600"
                      title="Delete Address"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressManager; 