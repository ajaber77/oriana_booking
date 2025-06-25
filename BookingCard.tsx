
import React from 'react';

interface BookingCardProps {
  icon: React.ReactNode;
  title: string;
  time: string;
  price: string; 
  isAvailable: boolean;
  bookedText: string; // Added prop for localized "Booked" text
}

const BookingCard: React.FC<BookingCardProps> = ({ icon, title, time, price, isAvailable, bookedText }) => {
  return (
    <div
      className={`
        relative w-full sm:w-1/2 md:w-1/3 lg:w-[30%] xl:w-[280px]
        flex flex-col items-center justify-between
        p-6 m-3 rounded-xl
        transition-all duration-300 ease-in-out
        transform hover:scale-105
        ${
          isAvailable
            ? 'bg-white text-gray-800 border border-gray-200 shadow-lg hover:shadow-xl'
            : 'bg-gray-200 text-gray-500 opacity-60 cursor-not-allowed shadow-md'
        }
      `}
    >
      {!isAvailable && (
        <div className="absolute top-2 end-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md"> {/* Use end-2 for RTL support */}
          {bookedText}
        </div>
      )}
      <div className={`mb-4 ${isAvailable ? '' : 'filter grayscale'}`}>{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-center">{title}</h3>
      <p className="text-sm text-center mb-1">{time}</p>
      <p className="text-lg font-bold mt-2">{price}</p>
    </div>
  );
};

export default BookingCard;
