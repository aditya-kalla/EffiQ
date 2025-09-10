import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getServiceById, createBooking, getUserData } from '../firebase/firestoreService';
import { useAuth } from '../context/AuthContext';
import { Service, SpecificService } from '../types';

const BookingPage: React.FC = () => {
  const { serviceId, specificServiceId } = useParams<{ 
    serviceId: string;
    specificServiceId: string;
  }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [service, setService] = useState<Service | null>(null);
  const [specificService, setSpecificService] = useState<SpecificService | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [userBalance, setUserBalance] = useState<number>(0);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    const fetchData = async () => {
      if (!serviceId || !specificServiceId) return;
      
      setLoading(true);
      const fetchedService = await getServiceById(serviceId);
      
      if (fetchedService && fetchedService.specificServices[specificServiceId]) {
        setService(fetchedService);
        setSpecificService(fetchedService.specificServices[specificServiceId]);
        
        // Set the first available date as default
        const dates = fetchedService.specificServices[specificServiceId].availableDates;
        if (dates.length > 0) {
          setSelectedDate(dates[0]);
        }
      }
      
      // Fetch user balance
      const userData = await getUserData(currentUser.uid);
      if (userData) {
        setUserBalance(userData.balance);
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, [serviceId, specificServiceId, currentUser, navigate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDate(e.target.value);
    setSelectedTime('');
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTime(e.target.value);
  };

  const handleBookingSubmit = async () => {
    if (!currentUser || !serviceId || !specificServiceId || !service || !specificService) {
      return;
    }
    
    if (!selectedDate || !selectedTime) {
      setError('Please select a date and time.');
      return;
    }
    
    if (userBalance < specificService.tokenFee) {
      setError('Insufficient balance. Please add funds to your account.');
      return;
    }
    
    setBookingInProgress(true);
    
    try {
      const bookingData = {
        service: service.name,
        specificService: specificServiceId.replace(/-/g, ' '),
        date: selectedDate,
        time: selectedTime,
        tokenFee: specificService.tokenFee,
        status: 'Confirmed' as const
      };
      
      const success = await createBooking(
        currentUser.uid,
        serviceId,
        specificServiceId,
        bookingData
      );
      
      if (success) {
        navigate('/booking-success', { 
          state: { 
            booking: bookingData,
            balance: userBalance - specificService.tokenFee
          }
        });
      }
    } catch (error) {
      console.error('Booking error:', error);
      setError('Failed to create booking. Please try again.');
    } finally {
      setBookingInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!service || !specificService) {
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
          ← Back to Service Details
        </button>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold mb-2">Book Appointment</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">{service.name}</h2>
              <p className="text-gray-600">
                {specificServiceId ? specificServiceId.replace(/-/g, ' ') : ''}
              </p>
            </div>
            <div className="text-right">
              <div className="text-gray-600 mb-1">Token Fee</div>
              <div className="text-2xl font-bold">₹{specificService.tokenFee}</div>
              <div className="text-sm text-gray-500">
                Your Balance: ₹{userBalance}
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Select Date</label>
            <select
              className="w-full p-2 border border-gray-300 rounded"
              value={selectedDate}
              onChange={handleDateChange}
            >
              {specificService.availableDates.length === 0 ? (
                <option value="">No dates available</option>
              ) : (
                <>
                  <option value="">Select a date</option>
                  {specificService.availableDates.map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </>
              )}
            </select>
          </div>
          
          {selectedDate && (
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Select Time</label>
              <select
                className="w-full p-2 border border-gray-300 rounded"
                value={selectedTime}
                onChange={handleTimeChange}
              >
                {specificService.timeSlots[selectedDate]?.length === 0 ? (
                  <option value="">No time slots available</option>
                ) : (
                  <>
                    <option value="">Select a time</option>
                    {specificService.timeSlots[selectedDate]?.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </>
                )}
              </select>
            </div>
          )}
          
          <div className="mt-8">
            <button
              onClick={handleBookingSubmit}
              disabled={!selectedDate || !selectedTime || bookingInProgress}
              className={`w-full py-3 rounded-md font-medium ${
                !selectedDate || !selectedTime || bookingInProgress
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {bookingInProgress ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </span>
              ) : (
                'Confirm Booking'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;