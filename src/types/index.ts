export interface User {
    uid: string;
    name: string;
    email: string;
    balance: number;
    bookingHistory: Booking[];
  }
  
  export interface Booking {
    id?: string;
    service: string;
    specificService: string;
    date: string;
    time: string;
    tokenFee: number;
    status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
    createdAt: Date;
  }
  
  export interface Service {
    id: string;
    name: string;
    category: 'Hospitals' | 'Restaurants' | 'Government Offices';
    location: {
      latitude: number;
      longitude: number;
    };
    specificServices: {
      [key: string]: SpecificService;
    };
  }
  
  export interface SpecificService {
    id?: string;
    name?: string;
    availableDates: string[];
    timeSlots: {
      [date: string]: string[];
    };
    tokenFee: number;
  }