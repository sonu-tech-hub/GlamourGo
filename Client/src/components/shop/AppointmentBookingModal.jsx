// components/shop/AppointmentBookingModal.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaCalendarAlt, FaClock, FaMoneyBillWave, FaCheck } from 'react-icons/fa';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { getAvailableTimeSlots, createAppointment } from '../../services/appointmentService';
import { validatePromotion } from '../../services/promotionService';
import LoadingSpinner from '../common/LoadingSpinner';

const AppointmentBookingModal = ({ isOpen, onClose, shop, service, services }) => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedService, setSelectedService] = useState(service || null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [notes, setNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [couponValid, setCouponValid] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Get available time slots when date or service changes
  useEffect(() => {
    if (!selectedService) return;
    
    const fetchTimeSlots = async () => {
      setIsLoading(true);
      try {
        const response = await getAvailableTimeSlots({
          shopId: shop._id,
          serviceId: selectedService._id,
          date: format(selectedDate, 'yyyy-MM-dd')
        });
        
        setAvailableSlots(response.data.availableSlots);
        setSelectedSlot(null); // Reset selected slot when date changes
      } catch (error) {
        console.error('Error fetching time slots:', error);
        toast.error('Failed to load available time slots');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTimeSlots();
  }, [selectedDate, selectedService, shop._id]);
  
  const handleServiceChange = (e) => {
    const serviceId = e.target.value;
    const service = services.find(s => s._id === serviceId);
    setSelectedService(service);
  };
  
  const validateCouponCode = async () => {
    if (!couponCode.trim()) {
      setCouponMessage('Please enter a coupon code');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await validatePromotion({
        shopId: shop._id,
        couponCode,
        serviceIds: [selectedService._id],
        totalAmount: selectedService.price
      });
      
      setCouponValid(true);
      setDiscount(response.data.discount);
      setCouponMessage('Coupon applied successfully!');
    } catch (error) {
      console.error('Error validating coupon:', error);
      setCouponValid(false);
      setDiscount(0);
      setCouponMessage(error.response?.data?.message || 'Invalid coupon code');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async () => {
    if (step === 1) {
      if (!selectedService) {
        return toast.error('Please select a service');
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedSlot) {
        return toast.error('Please select a time slot');
      }
      setStep(3);
    } else if (step === 3) {
      // Book appointment
      setIsProcessing(true);
      try {
        const appointmentData = {
          shopId: shop._id,
          serviceId: selectedService._id,
          date: format(selectedDate, 'yyyy-MM-dd'),
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          paymentMethod,
          notes,
          couponCode: couponValid ? couponCode : null
        };
        
        const response = await createAppointment(appointmentData);
        
        toast.success('Appointment booked successfully!');
        
        // If payment method is online, redirect to payment page
        if (paymentMethod === 'online') {
          navigate(`/payment/${response.data.appointment._id}`);
        } else {
          navigate(`/appointments/${response.data.appointment._id}`);
        }
        
        onClose();
      } catch (error) {
        console.error('Error booking appointment:', error);
        toast.error(error.response?.data?.message || 'Failed to book appointment');
      } finally {
        setIsProcessing(false);
      }
    }
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onClose();
    }
  };
  
  // Function to filter out past dates
  const filterDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[#a38772]">
            {step === 1 ? 'Select Service' : 
             step === 2 ? 'Select Date & Time' : 
             'Confirm Appointment'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="p-6">
          {/* Step indicators */}
          <div className="flex mb-6">
            <div className={`flex-1 text-center relative ${step >= 1 ? 'text-[#doa189]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-[#doa189] bg-[#doa189] text-white' : 'border-gray-300'}`}>
                1
              </div>
              <div className="mt-2 text-sm">Service</div>
              {step > 1 && <div className="absolute top-4 left-1/2 w-full h-0.5 bg-[#doa189] z-0"></div>}
            </div>
            
            <div className={`flex-1 text-center relative ${step >= 2 ? 'text-[#doa189]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-[#doa189] bg-[#doa189] text-white' : 'border-gray-300'}`}>
                2
              </div>
              <div className="mt-2 text-sm">Date & Time</div>
              {step > 2 && <div className="absolute top-4 left-1/2 w-full h-0.5 bg-[#doa189] z-0"></div>}
            </div>
            
            <div className={`flex-1 text-center ${step >= 3 ? 'text-[#doa189]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-[#doa189] bg-[#doa189] text-white' : 'border-gray-300'}`}>
                3
              </div>
              <div className="mt-2 text-sm">Confirm</div>
            </div>
          </div>
          
          {/* Step 1: Service Selection */}
          {step === 1 && (
            <div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Select Service
                </label>
                <select
                  value={selectedService?._id || ''}
                  onChange={handleServiceChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189]"
                >
                  <option value="">Select a service</option>
                  {services.map(service => (
                    <option key={service._id} value={service._id}>
                      {service.name} - ₹{service.price}
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedService && (
                <div className="bg-[#fef4ea] p-4 rounded-lg mb-4">
                  <h3 className="font-semibold text-[#a38772] mb-2">
                    {selectedService.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {selectedService.description}
                  </p>
                  <div className="flex justify-between">
                    <span className="text-gray-700">
                      <FaClock className="inline-block mr-1" />
                      {selectedService.duration} mins
                    </span>
                    <span className="font-semibold text-[#doa189]">
                      ₹{selectedService.price}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Step 2: Date & Time Selection */}
          {step === 2 && (
            <div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Select Date
                </label>
                <DatePicker
                  selected={selectedDate}
                  onChange={date => setSelectedDate(date)}
                  minDate={new Date()}
                  filterDate={filterDate}
                  dateFormat="MMMM d, yyyy"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189]"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Select Time Slot
                </label>
                
                {isLoading ? (
                  <div className="text-center py-4">
                    <LoadingSpinner size="small" />
                    <p className="text-gray-500 mt-2">Loading available slots...</p>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`p-2 text-center border rounded-lg transition-colors ${
                          selectedSlot === slot 
                            ? 'bg-[#doa189] text-white border-[#doa189]' 
                            : 'border-gray-300 hover:border-[#doa189]'
                        }`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {slot.startTime}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    No available slots for this date. Please try another date.
                  </p>
                )}
              </div>
              
              {selectedSlot && (
                <div className="bg-[#fef4ea] p-4 rounded-lg">
                  <h3 className="font-semibold text-[#a38772] mb-1">
                    Selected Time Slot
                  </h3>
                  <p className="text-gray-700">
                    {format(selectedDate, 'MMMM d, yyyy')} at {selectedSlot.startTime} - {selectedSlot.endTime}
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div>
              <div className="bg-[#fef4ea] p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-[#a38772] mb-2">
                  Appointment Details
                </h3>
                
                <div className="space-y-3 text-gray-700">
                  <p className="flex justify-between">
                    <span>Service:</span>
                    <span className="font-medium">{selectedService.name}</span>
                  </p>
                  
                  <p className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-medium">{format(selectedDate, 'MMMM d, yyyy')}</span>
                  </p>
                  
                  <p className="flex justify-between">
                    <span>Time:</span>
                    <span className="font-medium">{selectedSlot.startTime} - {selectedSlot.endTime}</span>
                  </p>
                  
                  <p className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">{selectedService.duration} mins</span>
                  </p>
                  
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <p className="flex justify-between font-medium">
                      <span>Price:</span>
                      <span>₹{selectedService.price}</span>
                    </p>
                    
                    {discount > 0 && (
                      <>
                        <p className="flex justify-between text-red-500">
                          <span>Discount:</span>
                          <span>-₹{discount}</span>
                        </p>
                        
                        <p className="flex justify-between font-bold text-[#doa189] text-lg mt-1">
                          <span>Total:</span>
                          <span>₹{selectedService.price - discount}</span>
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific requirements or information for the service provider"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189]"
                  rows="2"
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Have a Coupon Code?
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:border-[#doa189]"
                    disabled={couponValid}
                  />
                  <button
                    type="button"
                    onClick={validateCouponCode}
                    disabled={isLoading || couponValid}
                    className={`px-4 py-3 rounded-r-lg font-medium ${
                      couponValid 
                        ? 'bg-green-500 text-white' 
                        : 'bg-[#doa189] text-white hover:bg-[#ecdfcf]'
                    }`}
                  >
                    {couponValid ? <FaCheck /> : 'Apply'}
                  </button>
                </div>
                {couponMessage && (
                  <p className={`mt-1 text-sm ${couponValid ? 'text-green-600' : 'text-red-500'}`}>
                    {couponMessage}
                  </p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className={`p-3 border rounded-lg flex items-center justify-center transition-colors ${
                      paymentMethod === 'online' 
                        ? 'bg-[#doa189] text-white border-[#doa189]' 
                        : 'border-gray-300 hover:border-[#doa189]'
                    }`}
                    onClick={() => setPaymentMethod('online')}
                  >
                    <FaMoneyBillWave className="mr-2" />
                    Pay Online
                  </button>
                  
                  <button
                    type="button"
                    className={`p-3 border rounded-lg flex items-center justify-center transition-colors ${
                      paymentMethod === 'offline' 
                        ? 'bg-[#doa189] text-white border-[#doa189]' 
                        : 'border-gray-300 hover:border-[#doa189]'
                    }`}
                    onClick={() => setPaymentMethod('offline')}
                  >
                    <FaMoneyBillWave className="mr-2" />
                    Pay at Shop
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between p-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isProcessing}
            className="px-6 py-2 bg-[#doa189] text-white rounded-lg hover:bg-[#ecdfcf] transition-colors flex items-center"
          >
            {isProcessing ? (
              <>
                <LoadingSpinner size="small" className="mr-2" />
                Processing...
              </>
            ) : step < 3 ? (
              'Continue'
            ) : (
              'Confirm Booking'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBookingModal;
