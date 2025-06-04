// client/src/components/vendor/AppointmentCalendar.jsx
import React, { useState } from 'react';
import { format, addDays, startOfWeek, getDay, startOfMonth, getDaysInMonth } from 'date-fns';
import { FaChevronLeft, FaChevronRight, FaClock } from 'react-icons/fa';

const AppointmentCalendar = ({ appointments, isLoading }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
  
  // Move to previous week/month
  const goToPrevious = () => {
    if (viewMode === 'week') {
      setCurrentDate(prevDate => addDays(prevDate, -7));
    } else {
      setCurrentDate(prevDate => {
        const newDate = new Date(prevDate);
        newDate.setMonth(newDate.getMonth() - 1);
        return newDate;
      });
    }
  };
  
  // Move to next week/month
  const goToNext = () => {
    if (viewMode === 'week') {
      setCurrentDate(prevDate => addDays(prevDate, 7));
    } else {
      setCurrentDate(prevDate => {
        const newDate = new Date(prevDate);
        newDate.setMonth(newDate.getMonth() + 1);
        return newDate;
      });
    }
  };
  
  // Generate days for week view
  const getWeekDays = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
    return Array.from({ length: 7 }).map((_, index) => addDays(start, index));
  };
  
  // Generate days for month view
  const getMonthDays = () => {
    const firstDayOfMonth = startOfMonth(currentDate);
    const daysInMonth = getDaysInMonth(currentDate);
    const startDay = getDay(firstDayOfMonth);
    
    // Adjust for weeks starting on Monday (0 = Monday, 6 = Sunday)
    const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;
    
    const totalDays = adjustedStartDay + daysInMonth;
    const totalWeeks = Math.ceil(totalDays / 7);
    
    return Array.from({ length: totalWeeks * 7 }).map((_, index) => {
      const dayOffset = index - adjustedStartDay;
      return addDays(firstDayOfMonth, dayOffset);
    });
  };
  
  // Get appointment slots for a specific day
  const getDayAppointments = (day) => {
    if (!appointments) return [];
    
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return (
        appointmentDate.getDate() === day.getDate() &&
        appointmentDate.getMonth() === day.getMonth() &&
        appointmentDate.getFullYear() === day.getFullYear()
      );
    });
  };
  
  // Render week view
  const renderWeekView = () => {
    const weekDays = getWeekDays();
    
    return (
      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {weekDays.map((day, index) => (
          <div key={index} className="text-center">
            <div className="font-medium">{format(day, 'E')}</div>
            <div className={`text-sm rounded-full w-8 h-8 flex items-center justify-center mx-auto ${
              format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                ? 'bg-[#doa189] text-white'
                : ''
            }`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
        
        {/* Appointment slots */}
        {weekDays.map((day, dayIndex) => (
          <div key={dayIndex} className="h-32 border border-gray-200 rounded-lg p-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="w-5 h-5 border-2 border-[#doa189] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              getDayAppointments(day).map((appointment, appIndex) => (
                <div 
                  key={appIndex} 
                  className="text-xs bg-[#fef4ea] text-[#a38772] p-1 mb-1 rounded truncate"
                  title={`${appointment.service.name} - ${appointment.startTime}`}
                >
                  <div className="font-medium">{appointment.service.name}</div>
                  <div className="flex items-center">
                    <FaClock className="mr-1" size={8} />
                    {appointment.startTime}
                  </div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // Render month view
  const renderMonthView = () => {
    const monthDays = getMonthDays();
    const weekDayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return (
      <div>
        {/* Week day headers */}
        <div className="grid grid-cols-7 mb-2">
          {weekDayLabels.map((day, index) => (
            <div key={index} className="text-center font-medium">
              {day}
            </div>
          ))}
        </div>
        
        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {monthDays.map((day, index) => {
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            const dayAppointments = getDayAppointments(day);
            
            return (
              <div 
                key={index} 
                className={`p-1 border rounded-lg h-20 overflow-hidden ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-100 text-gray-400'
                }`}
              >
                <div className={`text-right ${isToday ? 'bg-[#doa189] text-white rounded-full w-6 h-6 flex items-center justify-center ml-auto' : ''}`}>
                  {format(day, 'd')}
                </div>
                
                {isLoading ? (
                  isCurrentMonth && <div className="w-full h-3 bg-gray-200 animate-pulse mt-1"></div>
                ) : (
                  isCurrentMonth && dayAppointments.length > 0 && (
                    <div className="mt-1">
                      {dayAppointments.length <= 2 ? (
                        dayAppointments.map((app, i) => (
                          <div key={i} className="text-xs bg-[#fef4ea] text-[#a38772] p-0.5 mb-0.5 rounded truncate">
                            {app.startTime}
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="text-xs bg-[#fef4ea] text-[#a38772] p-0.5 mb-0.5 rounded truncate">
                            {dayAppointments[0].startTime}
                          </div>
                          <div className="text-xs bg-[#doa189] text-white p-0.5 rounded text-center">
                            +{dayAppointments.length - 1} more
                          </div>
                        </>
                      )}
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <button
            onClick={goToPrevious}
            className="p-2 text-gray-600 hover:text-[#doa189]"
          >
            <FaChevronLeft />
          </button>
          
          <h3 className="font-semibold mx-2">
            {viewMode === 'week' 
              ? `Week of ${format(currentDate, 'MMMM d, yyyy')}`
              : format(currentDate, 'MMMM yyyy')
            }
          </h3>
          
          <button
            onClick={goToNext}
            className="p-2 text-gray-600 hover:text-[#doa189]"
          >
            <FaChevronRight />
          </button>
        </div>
        
        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          <button
            className={`px-3 py-1 text-sm ${viewMode === 'week' ? 'bg-[#doa189] text-white' : 'bg-white'}`}
            onClick={() => setViewMode('week')}
          >
            Week
          </button>
          <button
            className={`px-3 py-1 text-sm ${viewMode === 'month' ? 'bg-[#doa189] text-white' : 'bg-white'}`}
            onClick={() => setViewMode('month')}
          >
            Month
          </button>
        </div>
      </div>
      
      {viewMode === 'week' ? renderWeekView() : renderMonthView()}
    </div>
  );
};

export default AppointmentCalendar;
