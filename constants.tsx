
import React from 'react';
import { AppConfig, BookingOption, SlotType } from './types';
import SunIcon from './components/icons/SunIcon';
import NightIcon from './components/icons/NightIcon';
import StarIcon from './components/icons/StarIcon';
import { translations, TranslationKey, Language, getTranslation } from './locales'; // Import translations

// This is the initial application configuration.
// The app will allow managing bookings and custom prices in the UI,
// and provide a way to export the current configuration to update this.
export const INITIAL_APP_CONFIG: AppConfig = {
  bookedSlots: {
    // All slots are available by default now
  },
  customPrices: {
    // No custom prices by default now
  }
};

// Function to get booking options based on current language
export const getBookingOptions = (lang: Language): BookingOption[] => [
  {
    id: SlotType.MORNING,
    icon: <SunIcon className="w-12 h-12 text-yellow-500" />,
    title: getTranslation('morningSlotTitle', lang), // Updated key
    time: getTranslation('morningSessionTime', lang),
    price: "50 JOD", 
  },
  {
    id: SlotType.EVENING,
    icon: <NightIcon className="w-12 h-12 text-indigo-500" />,
    title: getTranslation('eveningSlotTitle', lang), // Updated key
    time: getTranslation('eveningSessionTime', lang),
    price: "70 JOD", 
  },
  {
    id: SlotType.FULL_DAY,
    icon: <StarIcon className="w-12 h-12 text-amber-500" />,
    title: getTranslation('fullDaySlotTitle', lang), // Updated key
    time: getTranslation('fullDaySessionTime', lang),
    price: "100 JOD", 
  },
];