import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getServicesByCategory } from '../firebase/firestoreService';
import { Service } from '../types';

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const category = queryParams.get('category') || '';

  useEffect(() => {
    const fetchServices = async () => {
      if (!category) {
        navigate('/');
        return;
      }
      
      setLoading(true);
      const fetchedServices = await getServicesByCategory(category);
      setServices(fetchedServices);
      setLoading(false);
    };
    
    fetchServices();
  }, [category, navigate]);

  const handleServiceSelect = (serviceId: string) => {
    navigate(`/service/${serviceId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{category}</h1>
      
      {services.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">No services available in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div 
              key={service.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={() => handleServiceSelect(service.id)}
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{service.name}</h2>
                <p className="text-gray-600 mb-4">
                  {Object.keys(service.specificServices).length} services available
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Starting from ₹{Math.min(
                      ...Object.values(service.specificServices).map(s => s.tokenFee)
                    )}
                  </span>
                  <button className="text-blue-600 hover:text-blue-800">
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Services;