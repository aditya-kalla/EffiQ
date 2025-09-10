import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Booking } from '../types';

interface BookingSuccessState {
  booking: Booking;
  balance: number;
}

const BookingSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, balance } = (location.state as BookingSuccessState) || {};

  if (!booking) {
    // Redirect to home if accessed directly
    navigate('/');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-10 w-10 text-green-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your appointment has been successfully booked.</p>
        </div>

        <div className="border-t border-b border-gray-200 py-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 mb-1">Service</p>
              <p className="font-semibold">{booking.service}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Specific Service</p>
              <p className="font-semibold">{booking.specificService}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Date</p>
              <p className="font-semibold">{booking.date}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Time</p>
              <p className="font-semibold">{booking.time}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Token Fee</p>
              <p className="font-semibold">₹{booking.tokenFee}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Status</p>
              <p className="font-semibold text-green-600">{booking.status}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-md p-4 mb-6">
          <p className="text-blue-800">
            Your updated balance: <span className="font-bold">₹{balance}</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/dashboard" 
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md font-medium text-center"
          >
            Go to Dashboard
          </Link>
          <Link 
            to="/" 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-md font-medium text-center"
          >
            Book Another Appointment
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;