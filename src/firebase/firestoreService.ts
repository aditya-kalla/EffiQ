import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    setDoc, 
    updateDoc, 
    query, 
    where, 
    arrayUnion,
    increment,
    Timestamp,
    addDoc
  } from 'firebase/firestore';
  import { db } from './config';
  import { Booking, Service, User } from '../types';
  
  // User related operations
  export const getUserData = async (userId: string): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data() as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };
  
  export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<void> => {
    try {
      await updateDoc(doc(db, 'users', userId), data);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };
  
  // Service related operations
  export const getServiceCategories = async (): Promise<string[]> => {
    try {
      const categories = ['Hospitals', 'Restaurants', 'Government Offices'];
      return categories;
    } catch (error) {
      console.error('Error fetching service categories:', error);
      return [];
    }
  };
  
  export const getServicesByCategory = async (category: string): Promise<Service[]> => {
    try {
      const servicesQuery = query(collection(db, 'services'), where('category', '==', category));
      const querySnapshot = await getDocs(servicesQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Service[];
    } catch (error) {
      console.error('Error fetching services by category:', error);
      return [];
    }
  };
  
  export const getServiceById = async (serviceId: string): Promise<Service | null> => {
    try {
      const serviceDoc = await getDoc(doc(db, 'services', serviceId));
      if (serviceDoc.exists()) {
        return { id: serviceDoc.id, ...serviceDoc.data() } as Service;
      }
      return null;
    } catch (error) {
      console.error('Error fetching service:', error);
      return null;
    }
  };
  
  // Booking related operations
  export const createBooking = async (
    userId: string, 
    serviceId: string, 
    specificServiceId: string,
    booking: Omit<Booking, 'id' | 'createdAt'>
  ): Promise<boolean> => {
    try {
      // Get user and service data
      const userDoc = await getDoc(doc(db, 'users', userId));
      const serviceDoc = await getDoc(doc(db, 'services', serviceId));
      
      if (!userDoc.exists() || !serviceDoc.exists()) {
        throw new Error('User or service not found');
      }
      
      const userData = userDoc.data() as User;
      const serviceData = serviceDoc.data() as Service;
      
      // Check if user has sufficient balance
      if (userData.balance < booking.tokenFee) {
        throw new Error('Insufficient balance');
      }
      
      // Add booking to user's booking history
      const bookingData = {
        ...booking,
        createdAt: Timestamp.now()
      };
      
      // Create booking record
      const bookingRef = await addDoc(collection(db, 'bookings'), {
        userId,
        serviceId,
        specificServiceId,
        ...bookingData
      });
      
      // Update user's balance and booking history
      await updateDoc(doc(db, 'users', userId), {
        balance: increment(-booking.tokenFee),
        bookingHistory: arrayUnion({
          id: bookingRef.id,
          ...bookingData
        })
      });
      
      // Update available slots in the service
      const specificService = serviceData.specificServices[specificServiceId];
      const updatedTimeSlots = { ...specificService.timeSlots };
      
      // Remove the booked time slot
      updatedTimeSlots[booking.date] = specificService.timeSlots[booking.date].filter(
        slot => slot !== booking.time
      );
      
      await updateDoc(doc(db, 'services', serviceId), {
        [`specificServices.${specificServiceId}.timeSlots.${booking.date}`]: updatedTimeSlots[booking.date]
      });
      
      return true;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  };
  
  export const getUserBookings = async (userId: string): Promise<Booking[]> => {
    try {
      const bookingsQuery = query(collection(db, 'bookings'), where('userId', '==', userId));
      const querySnapshot = await getDocs(bookingsQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return [];
    }
  };
  
  export const cancelBooking = async (
    userId: string, 
    bookingId: string, 
    serviceId: string, 
    specificServiceId: string,
    date: string,
    time: string,
    tokenFee: number
  ): Promise<boolean> => {
    try {
      // Update booking status
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'Cancelled'
      });
      
      // Refund user's balance
      await updateDoc(doc(db, 'users', userId), {
        balance: increment(tokenFee)
      });
      
      // Update user's booking history
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        const updatedHistory = userData.bookingHistory.map(booking => {
          if (booking.id === bookingId) {
            return { ...booking, status: 'Cancelled' };
          }
          return booking;
        });
        
        await updateDoc(doc(db, 'users', userId), {
          bookingHistory: updatedHistory
        });
      }
      
      // Add the time slot back to available slots
      const serviceDoc = await getDoc(doc(db, 'services', serviceId));
      if (serviceDoc.exists()) {
        const serviceData = serviceDoc.data() as Service;
        const specificService = serviceData.specificServices[specificServiceId];
        
        const updatedTimeSlots = { ...specificService.timeSlots };
        if (!updatedTimeSlots[date]) {
          updatedTimeSlots[date] = [];
        }
        updatedTimeSlots[date].push(time);
        
        await updateDoc(doc(db, 'services', serviceId), {
          [`specificServices.${specificServiceId}.timeSlots.${date}`]: updatedTimeSlots[date]
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  };