// client/src/utils/helpers.js
import { format, parseISO, isToday, isYesterday, differenceInCalendarDays } from 'date-fns';

// Format date
export const formatDate = (dateString, formatPattern = 'MMM d, yyyy') => {
  try {
    const date = parseISO(dateString);
    return format(date, formatPattern);
  } catch (error) {
    return dateString;
  }
};

// Format time
export const formatTime = (timeString) => {
  try {
    // Convert 24-hour format to 12-hour format
    const [hour, minute] = timeString.split(':');
    const hourInt = parseInt(hour, 10);
    const period = hourInt >= 12 ? 'PM' : 'AM';
    const hour12 = hourInt % 12 || 12;
    return `${hour12}:${minute} ${period}`;
  } catch (error) {
    return timeString;
  }
};

// Format date relative to today
export const formatRelativeDate = (dateString) => {
  try {
    const date = parseISO(dateString);
    
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      const daysDiff = differenceInCalendarDays(new Date(), date);
      
      if (daysDiff < 7) {
        return format(date, 'EEEE'); // Day name
      } else {
        return format(date, 'MMM d, yyyy');
      }
    }
  } catch (error) {
    return dateString;
  }
};

// Format price
export const formatPrice = (price) => {
  return `₹${parseFloat(price).toFixed(2)}`;
};

// Format phone number
export const formatPhoneNumber = (phoneNumber) => {
  // Format Indian phone numbers as +91 XXXXX XXXXX
  if (phoneNumber && phoneNumber.length === 10) {
    return `+91 ${phoneNumber.slice(0, 5)} ${phoneNumber.slice(5)}`;
  }
  return phoneNumber;
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  // Get appointment status color
  export const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get status display text (capitalize first letter)
  export const getStatusText = (status) => {
    if (!status) return '';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  // Generate time slots for a day
  export const generateTimeSlots = (startTime, endTime, interval = 30) => {
    const slots = [];
    let start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    while (start < end) {
      const formattedTime = format(start, 'HH:mm');
      slots.push(formattedTime);
      
      // Add interval minutes to start time
      start = new Date(start.getTime() + interval * 60000);
    }
    
    return slots;
  };
  
  // Calculate the duration between two time strings
  export const calculateDuration = (startTime, endTime) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    const diffInMinutes = (end - start) / (1000 * 60);
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} mins`;
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = diffInMinutes % 60;
      return minutes > 0 ? `${hours} hr ${minutes} mins` : `${hours} hr`;
    }
  };
  
  // Validate email format
  export const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  // Validate phone number (10 digits)
  export const isValidPhone = (phone) => {
    return /^\d{10}$/.test(phone);
  };
  
  // Validate password strength
  export const isStrongPassword = (password) => {
    return password.length >= 8;
  };
  
  // Generate initials from name
  export const getInitials = (name) => {
    if (!name) return '';
    
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };