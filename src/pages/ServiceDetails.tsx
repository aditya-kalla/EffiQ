import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getServiceById } from '../firebase/firestoreService';
import { Service, SpecificService } from '../types';
import { useAuth } from '../context/AuthContext';

const ServiceDetails: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string>('');
  
  useEffect(() => {
    const fetchService = async () => {
      if (!serviceId) return;
      
      setLoading(true);
      const fetchedService = await getServiceById(serviceId);
      setService(fetchedService);
      setLoading(false);
    };
    
    fetchService();
  }, [serviceId]);

  const handleSpecificServiceSelect = (specificServiceId: string) => {
    setSelectedService(specificServiceId);
    navigate(`/booking/${serviceId}/${specificServiceId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Service not found</h1>
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Back to {service.category}
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold mb-2">{service.name}</h1>
        <p className="text-gray-600 mb-4">Category: {service.category}</p>
        
        {!currentUser && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <p className="text-yellow-800">
              Please <a href="/login" className="font-medium underline">log in</a> to book an appointment.
            </p>
          </div>
        )}
      </div>
      
      <h2 className="text-2xl font-semibold mb-4">Available Services</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(service.specificServices).map(([id, specificService]) => (
          <div 
            key={id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            onClick={() => handleSpecificServiceSelect(id)}
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">
                {specificService.name || id.replace(/-/g, ' ')}
              </h3>
              <p className="text-gray-600 mb-4">
                {specificService.availableDates.length} days available
              </p>
              <div className="flex justify-between items-center">
                <span className="font-medium text-lg">
                  ₹{specificService.tokenFee}
                </span>
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  disabled={!currentUser}
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceDetails;