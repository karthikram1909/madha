import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday } from "date-fns";
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function CalendarGrid({ currentDate, onBookingClick, serviceDetails, getBookingsForDate, isLoading, onDateClick }) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startingDay = getDay(monthStart);

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (isLoading) {
    return <div className="text-center py-12">Loading calendar...</div>;
  }

  return (
    <TooltipProvider>
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map(day => (
          <div key={day} className="text-center font-semibold text-slate-600 text-sm py-2">{day}</div>
        ))}
        
        {Array.from({ length: startingDay }).map((_, i) => (
          <div key={`empty-${i}`} className="border rounded-lg bg-slate-50/50 min-h-[120px]"></div>
        ))}

        {days.map(day => {
          const bookingsForDay = getBookingsForDate(day);
          return (
            <div 
              key={day.toString()} 
              className={`border rounded-lg p-1.5 min-h-[120px] transition-colors duration-200 flex flex-col cursor-pointer hover:bg-slate-50 ${isToday(day) ? 'bg-red-50 border-red-200' : 'bg-white'}`}
              onClick={() => onDateClick && onDateClick(day, bookingsForDay)}
            >
              <div className={`font-semibold text-right ${isToday(day) ? 'text-red-600' : 'text-slate-800'}`}>
                {format(day, "d")}
              </div>
              <div className="space-y-1 mt-1 flex-grow">
                {bookingsForDay.slice(0, 3).map(booking => {
                  const details = serviceDetails[booking.service_type] || serviceDetails.default;
                  return (
                    <Tooltip key={booking.id}>
                      <TooltipTrigger asChild>
                        <motion.div
                          onClick={(e) => {
                            e.stopPropagation();
                            onBookingClick(booking);
                          }}
                          className={`text-xs p-1.5 rounded cursor-pointer truncate flex items-center gap-1.5 ${details.color}`}
                          whileHover={{ scale: 1.05, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <span className="font-medium flex-1">{booking.beneficiary_name}</span>
                          {booking.payment_status === 'completed' 
                            ? <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                            : <AlertCircle className="w-3 h-3 flex-shrink-0" />
                          }
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-semibold">{details.label}</p>
                        <p>For: {booking.beneficiary_name}</p>
                        <p>Status: {booking.status}, Payment: {booking.payment_status}</p>
                        <p className="max-w-xs truncate">Intention: {booking.intention_text}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
                {bookingsForDay.length > 3 && (
                  <div className="text-xs text-slate-500 font-medium text-center pt-1">
                    + {bookingsForDay.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}