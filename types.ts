import React from 'react';

export enum SlotType {
  MORNING = "morning",
  EVENING = "evening",
  FULL_DAY = "full_day",
}

export interface BookedSlotsData {
  [date: string]: SlotType[]; // Format "YYYY-MM-DD": ["morning", "evening", "full_day"]
}

export interface BookingOption {
  id: SlotType;
  icon: React.ReactNode;
  title: string;
  time: string;
  price: string; // Default price
}

// Represents custom prices for slots on a specific date
export interface CustomSlotPrices {
  [slotType: string]: string; // e.g., SlotType.MORNING: "75 JOD"
}

// Represents all custom prices, keyed by date
export interface CustomPricesData {
  [date: string]: CustomSlotPrices; // Format "YYYY-MM-DD": { "morning": "75 JOD" }
}

// Represents the entire application configuration for persistence
export interface AppConfig {
  bookedSlots: BookedSlotsData;
  customPrices: CustomPricesData;
}
