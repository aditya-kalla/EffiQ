import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getServiceCategories } from '../firebase/firestoreService';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadCategories = async () => {
      const fetchedCategories = await getServiceCategories();
      setCategories(fetchedCategories);
    };
    loadCategories();
  }, []);

  const handleCategorySelect = (category: string) => {
    navigate(`/services?category=${category}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Welcome to EffiQ</h1>
      <div className="max-w-2xl mx-auto">
        <p className="text-lg text-center mb-8">
          Book appointments for hospitals, restaurants, and government offices in one place.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {categories.map((category) => (
            <div 
              key={category}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={() => handleCategorySelect(category)}
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{category}</h2>
                <p className="text-gray-600">
                  Book appointments for {category.toLowerCase()}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {currentUser ? (
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
            >
              View Your Dashboard
            </button>
          </div>
        ) : (
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md font-medium"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;