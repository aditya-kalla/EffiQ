import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import BookingPage from './pages/BookingPage';
import BookingSuccess from './pages/BookingSuccess';
import ServiceDetails from './pages/ServiceDetails';
import Services from './pages/Services';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/booking/:serviceId/:specificServiceId" element={<BookingPage />} />
      <Route path="/booking-success" element={<BookingSuccess />} />
      <Route path="/service/:serviceId" element={<ServiceDetails />} />
      <Route path="/services" element={<Services />} />
    </Routes>
  );
};

export default App;