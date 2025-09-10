import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserData, getUserBookings, cancelBooking } from '../firebase/firestoreService';
import { useAuth } from '../context/AuthContext';
import { User, Booking } from '../types';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    const fetchUserData = async () => {
      setLoading(true);
      const fetchedUserData = await getUserData(currentUser.uid);
      const fetchedBookings = await getUserBookings(currentUser.uid);
      
      setUserData(fetchedUserData);
      setBookings(fetchedBookings);
      setLoading(false);
    };
    
    fetchUserData();
  }, [currentUser, navigate]);

  const upcomingBookings = bookings.filter(
    booking => new Date(booking.date + 'T' + booking.time) >= new Date() && booking.status !== 'Cancelled'
  );
  
  const pastBookings = bookings.filter(
    booking => new Date(booking.date + 'T' + booking.time) < new Date() || booking.status === 'Cancelled'
  );

  const handleCancelBooking = async (booking: Booking) => {
    if (!currentUser || !booking.id) return;
    
    setIsProcessing(true);
    
    try {
      await cancelBooking(
        currentUser.uid,
        booking.id,
        // These fields would need to be stored in the actual booking record
        // This is simplified for the example
        'serviceId', // Replace with actual booking.serviceId
        'specificServiceId', // Replace with actual booking.specificServiceId
        booking.date,
        booking.time,
        booking.tokenFee
      );
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(b => 
          b.id === booking.id ? { ...b, status: 'Cancelled' } : b
        )
      );
      
      // Also update user data to reflect new balance
      const updatedUserData = await getUserData(currentUser.uid);
      setUserData(updatedUserData);
      
    } catch (error) {
      console.error('Error cancelling booking:', error);
    } finally {
      setIsProcessing(false);
    }
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
      <h1 className="text-3xl font-bold mb-8">Your Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Balance</h2>
          <p className="text-3xl font-bold text-blue-600">₹{userData?.balance || 0}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Upcoming</h2>
          <p className="text-3xl font-bold text-green-600">{upcomingBookings.length}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Completed</h2>
          <p className="text-3xl font-bold text-gray-600">
            {pastBookings.filter(b => b.status === 'Completed').length}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Cancelled</h2>
          <p className="text-3xl font-bold text-red-600">
            {pastBookings.filter(b => b.status === 'Cancelled').length}
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              className={`py-4 px-6 font-medium ${
                activeTab === 'upcoming' 
                  ? 'border-b-2 border-blue-600 text-blue-600' 
                  : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming Bookings
            </button>
            <button
              className={`py-4 px-6 font-medium ${
                activeTab === 'past' 
                  ? 'border-b-2 border-blue-600 text-blue-600' 
                  : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('past')}
            >
              Past Bookings
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {(activeTab === 'upcoming' ? upcomingBookings : pastBookings).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No {activeTab} bookings found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Token Fee
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    {activeTab === 'upcoming' && (
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(activeTab === 'upcoming' ? upcomingBookings : pastBookings).map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {booking.service}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.specificService}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {booking.date}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{booking.tokenFee}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.status === 'Confirmed' 
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'Cancelled'
                            ? 'bg-red-100 text-red-800'
                            : booking.status === 'Completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      {activeTab === 'upcoming' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleCancelBooking(booking)}
                            disabled={isProcessing || booking.status === 'Cancelled'}
                            className={`text-red-600 hover:text-red-900 ${
                              isProcessing || booking.status === 'Cancelled'
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                            }`}
                          >
                            Cancel
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;