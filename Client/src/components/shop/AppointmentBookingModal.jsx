// components/shop/AppointmentBookingModal.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaClock, FaMoneyBillWave, FaCheck } from 'react-icons/fa';
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
  const [selectedService, setSelectedService] = useState(service && service._id ? service : null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [notes, setNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [couponValid, setCouponValid] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // Used for fetching slots and validating coupon
  const [isProcessing, setIsProcessing] = useState(false); // Used for booking appointment

  // --- EFFECT HOOK TO FETCH AVAILABLE SLOTS ---
  useEffect(() => {
    // Only fetch if a service is selected, shop is available, and selectedDate is valid
    if (!selectedService || !shop?._id || !selectedDate) {
      console.log("Required data (selectedService, shopId, or selectedDate) not yet available. Skipping slot fetch.");
      setAvailableSlots([]); // Clear slots if inputs are incomplete
      setSelectedSlot(null); // Reset selected slot
      // Ensure isLoading is false if we're skipping the fetch
      if (isLoading) setIsLoading(false);
      return;
    }

    const fetchTimeSlots = async () => {
      setIsLoading(true); // Start loading state
      try {
        const slotsResponse = await getAvailableTimeSlots({
          shopId: shop._id,
          serviceId: selectedService._id,
          date: format(selectedDate, 'yyyy-MM-dd')
        });

        if (slotsResponse && Array.isArray(slotsResponse.availableSlots)) {
          setAvailableSlots(slotsResponse.availableSlots);
          // Set selected slot to the first available one if none is selected or if the previously selected one isn't available
          if (!selectedSlot || !slotsResponse.availableSlots.some(slot => slot.startTime === selectedSlot.startTime && slot.endTime === selectedSlot.endTime)) {
            setSelectedSlot(slotsResponse.availableSlots.length > 0 ? slotsResponse.availableSlots[0] : null);
          }
        } else {
          console.warn("Received unexpected response structure for time slots, or missing availableSlots array:", slotsResponse);
          toast.error('Unexpected data received for available time slots.');
          setAvailableSlots([]);
          setSelectedSlot(null);
        }

      } catch (error) {
        console.error('Error fetching time slots in modal:', error);
        const errorMessage = error.message || error.response?.data?.message || 'Failed to load available time slots. Please try again.';
        toast.error(errorMessage);
        setAvailableSlots([]);
        setSelectedSlot(null);
      } finally {
        setIsLoading(false); // Always stop loading when done
      }
    };

    fetchTimeSlots();
  }, [selectedDate, selectedService, shop?._id]);

  const handleServiceChange = (e) => {
    const serviceId = e.target.value;
    const serviceFound = services.find(s => s._id === serviceId);
    setSelectedService(serviceFound);
    // Reset coupon info if service changes
    setCouponCode('');
    setCouponMessage('');
    setCouponValid(false);
    setDiscount(0);
  };

  const validateCouponCode = async () => {
    if (!couponCode.trim()) {
      setCouponMessage('Please enter a coupon code.');
      setCouponValid(false);
      setDiscount(0);
      return;
    }
    if (!selectedService) {
      setCouponMessage('Please select a service first.');
      setCouponValid(false);
      setDiscount(0);
      return;
    }

    setIsLoading(true); // Use isLoading for coupon validation as well
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
      toast.success('Coupon applied!');
    } catch (error) {
      console.error('Error validating coupon:', error);
      setCouponValid(false);
      setDiscount(0);
      const errorMessage = error.response?.data?.message || 'Invalid coupon code or not applicable.';
      setCouponMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false); // Stop loading after coupon validation
    }
  };

  const handleSubmit = async () => {
    if (step === 1) {
      if (!selectedService) {
        return toast.error('Please select a service to continue.');
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedSlot) {
        return toast.error('Please select a time slot to continue.');
      }
      setStep(3);
    } else if (step === 3) {
      // Book appointment
      setIsProcessing(true); // Use isProcessing for the final booking step
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

        // --- FIX START ---
        // Ensure that response.data and response.data.appointment exist
        const createdAppointment = response?.data?.appointment || response?.appointment || response?.data || response;

        if (!createdAppointment || !createdAppointment._id) {
          throw new Error('Failed to retrieve appointment details after booking. Please check server response.');
        }
        // --- FIX END ---

        toast.success('Appointment booked successfully!');

        // If payment method is online, redirect to payment page
        if (paymentMethod === 'online') {
          navigate(`/payment/${createdAppointment._id}`);
        } else {
          // Assuming there's an appointments detail page
          navigate(`/appointments/${createdAppointment._id}`);
        }

        onClose(); // Close modal after successful booking/redirection
      } catch (error) {
        console.error('Error booking appointment:', error);
        toast.error(error.message || error.response?.data?.message || 'Failed to book appointment. Please try again.');
      } finally {
        setIsProcessing(false); // Stop processing after booking attempt
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

  const filterDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for comparison
    return date >= today;
  };

  if (!isOpen) return null;

  const finalPrice = selectedService ? selectedService.price - discount : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 flex flex-col max-h-[90vh]"> {/* Added flex-col and max-h-[90vh] */}
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

        <div className="p-6 flex-grow overflow-y-auto"> {/* Added flex-grow and overflow-y-auto */}
          {/* Step indicators */}
          <div className="flex justify-between items-center mb-6 relative">
            {/* Line connecting steps */}
            <div className="absolute left-1/2 -translate-x-1/2 top-4 w-[calc(100%-80px)] h-0.5 bg-gray-300 z-0"></div>
            {step > 1 && <div className="absolute left-1/2 -translate-x-1/2 top-4 w-[calc(100%-80px)] h-0.5 bg-[#d0a189] z-10" style={{ width: `${(step - 1) * 50}%` }}></div>}

            <div className={`flex-1 text-center relative z-20 ${step >= 1 ? 'text-[#d0a189]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-[#d0a189] bg-[#d0a189] text-white' : 'border-gray-300 bg-white'}`}>
                1
              </div>
              <div className="mt-2 text-sm">Service</div>
            </div>

            <div className={`flex-1 text-center relative z-20 ${step >= 2 ? 'text-[#d0a189]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-[#d0a189] bg-[#d0a189] text-white' : 'border-gray-300 bg-white'}`}>
                2
              </div>
              <div className="mt-2 text-sm">Date & Time</div>
            </div>

            <div className={`flex-1 text-center relative z-20 ${step >= 3 ? 'text-[#d0a189]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-[#d0a189] bg-[#d0a189] text-white' : 'border-gray-300 bg-white'}`}>
                3
              </div>
              <div className="mt-2 text-sm">Confirm</div>
            </div>
          </div>


          {/* Step 1: Service Selection */}
          {step === 1 && (
            <div>
              <div className="mb-4">
                <label htmlFor="service-select" className="block text-gray-700 font-medium mb-2">
                  Select Service
                </label>
                <select
                  id="service-select"
                  value={selectedService?._id || ''}
                  onChange={handleServiceChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189] appearance-none pr-8"
                  // Added appearance-none and pr-8 for custom arrow if needed
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
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 text-sm flex items-center">
                      <FaClock className="inline-block mr-1 text-gray-500" />
                      {selectedService.duration} mins
                    </span>
                    <span className="font-semibold text-[#d0a189] text-lg">
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
                  dateFormat="MMMM d, yyyy" // Corrected format to use 'yyyy' instead of 'RRRR'
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189] text-center"
                  // Added text-center for better date picker input alignment
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Select Time Slot
                </label>

                {isLoading ? (
                  <div className="text-center py-6">
                    <LoadingSpinner size="medium" />
                    <p className="text-gray-500 mt-3">Loading available slots...</p>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {availableSlots.map((slot, index) => (
                      <button
                        key={`${slot.startTime}-${slot.endTime}-${index}`} 
                        type="button"
                        className={`p-2 text-center border rounded-lg transition-colors text-sm font-medium
                          ${selectedSlot?.startTime === slot.startTime && selectedSlot?.endTime === slot.endTime
                            ? 'bg-[#d0a189] text-white border-[#d0a189] shadow-md'
                            : 'border-gray-300 hover:border-[#d0a189] hover:bg-[#fef4ea]'
                          }`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {slot.startTime}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4 border rounded-lg bg-gray-50">
                    No available slots for this date. Please try another date or service.
                  </p>
                )}
              </div>

              {selectedSlot && (
                <div className="bg-[#fef4ea] p-4 rounded-lg border border-[#d0a189]">
                  <h3 className="font-semibold text-[#a38772] mb-1">
                    Selected Time Slot
                  </h3>
                  <p className="text-gray-700 text-sm">
                    <FaClock className="inline-block mr-1 text-gray-500" />
                    {format(selectedDate, 'MMMM d, yyyy')} at {selectedSlot.startTime} - {selectedSlot.endTime} {/* Corrected format */}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div>
              <div className="bg-[#fef4ea] p-4 rounded-lg mb-4 border border-[#d0a189]">
                <h3 className="font-semibold text-[#a38772] mb-3 text-lg">
                  Appointment Summary
                </h3>

                <div className="space-y-2 text-gray-700">
                  <p className="flex justify-between items-center text-base">
                    <span className="font-medium">Service:</span>
                    <span>{selectedService?.name}</span>
                  </p>

                  <p className="flex justify-between items-center text-base">
                    <span className="font-medium">Date:</span>
                    <span>{format(selectedDate, 'MMMM d, yyyy')}</span> {/* Corrected format */}
                  </p>

                  <p className="flex justify-between items-center text-base">
                    <span className="font-medium">Time:</span>
                    <span>{selectedSlot?.startTime} - {selectedSlot?.endTime}</span>
                  </p>

                  <p className="flex justify-between items-center text-base">
                    <span className="font-medium">Duration:</span>
                    <span>{selectedService?.duration} mins</span>
                  </p>

                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <p className="flex justify-between font-semibold text-lg text-gray-800">
                      <span>Base Price:</span>
                      <span>₹{selectedService?.price}</span>
                    </p>

                    {discount > 0 && (
                      <>
                        <p className="flex justify-between text-red-500 text-base">
                          <span>Discount:</span>
                          <span>-₹{discount}</span>
                        </p>
                      </>
                    )}
                    <p className="flex justify-between font-bold text-[#d0a189] text-xl mt-2">
                      <span>Total Payable:</span>
                      <span>₹{finalPrice}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="notes-textarea" className="block text-gray-700 font-medium mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes-textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Any specific requirements or information for the service provider"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189] resize-y"
                  rows="3"
                ></textarea>
              </div>

              <div className="mb-4">
                <label htmlFor="coupon-input" className="block text-gray-700 font-medium mb-2">
                  Have a Coupon Code?
                </label>
                <div className="flex items-stretch"> {/* Use items-stretch to make input and button same height */}
                  <input
                    id="coupon-input"
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:border-[#d0a189] disabled:bg-gray-100 disabled:text-gray-500"
                    disabled={couponValid || isLoading}
                  />
                  <button
                    type="button"
                    onClick={validateCouponCode}
                    disabled={isLoading || couponValid || !selectedService}
                    className={`px-5 py-3 rounded-r-lg font-medium whitespace-nowrap
                      ${couponValid
                        ? 'bg-green-600 text-white cursor-not-allowed'
                        : 'bg-[#d0a189] text-white hover:bg-[#b88c6e]'
                      }
                      ${(!selectedService || isLoading) ? 'opacity-60 cursor-not-allowed' : ''}
                    `}
                  >
                    {isLoading ? (
                      <LoadingSpinner size="small" className="inline-block mr-2" />
                    ) : couponValid ? (
                      <FaCheck />
                    ) : (
                      'Apply'
                    )}
                  </button>
                </div>
                {couponMessage && (
                  <p className={`mt-2 text-sm ${couponValid ? 'text-green-600' : 'text-red-500'}`}>
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
                    className={`p-3 border rounded-lg flex items-center justify-center transition-colors text-base
                      ${paymentMethod === 'online'
                        ? 'bg-[#d0a189] text-white border-[#d0a189] shadow-md'
                        : 'border-gray-300 hover:border-[#d0a189] hover:bg-[#fef4ea]'
                      }`}
                    onClick={() => setPaymentMethod('online')}
                  >
                    <FaMoneyBillWave className="mr-2" />
                    Pay Online
                  </button>

                  <button
                    type="button"
                    className={`p-3 border rounded-lg flex items-center justify-center transition-colors text-base
                      ${paymentMethod === 'offline'
                        ? 'bg-[#d0a189] text-white border-[#d0a189] shadow-md'
                        : 'border-gray-300 hover:border-[#d0a189] hover:bg-[#fef4ea]'
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
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isProcessing}
            className="px-6 py-2 bg-[#d0a189] text-white rounded-lg hover:bg-[#b88c6e] transition-colors flex items-center justify-center font-medium min-w-[120px]"
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