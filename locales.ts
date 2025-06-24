
export const translations = {
  // PIN Entry
  pinEntryTitle: { en: "Oriana Chalet", ar: "شاليه أوريانا" },
  pinEntrySubtitle: { en: "Enter PIN for Owner Access", ar: "أدخل الرقم السري للوصول كمالك" },
  pinEntryPlaceholder: { en: "Enter PIN", ar: "أدخل الرقم السري" },
  pinEntryLoginOwner: { en: "Login as Owner", ar: "تسجيل الدخول كمالك" },
  pinEntryContinueEmployee: { en: "Login as Guest", ar: "تسجيل الدخول كزائر" }, // Changed
  pinEntryInvalidPin: { en: "Invalid PIN. Please try again.", ar: "الرقم السري غير صحيح. يرجى المحاولة مرة أخرى." },
  // App Header
  appHeaderTitle: { en: "Oriana Chalet", ar: "شاليه أوريانا" },
  appHeaderSubtitleOwner: { en: "Booking Management & Availability Checker", ar: "إدارة الحجوزات والتحقق من التوفر" },
  appHeaderSubtitleEmployee: { en: "Check Availability", ar: "التحقق من التوفر" },
  // Date Selection
  dateSelectionTitle: { en: "Select Date to Check:", ar: "اختر تاريخاً للتحقق:" },
  dateSelectionSelectedDateLabel: { en: "Selected:", ar: "التاريخ المحدد:" },
  // Booking Options
  bookingOptionsTitle: { en: "Booking Options for", ar: "خيارات الحجز ليوم" }, // Date will be appended
  bookingCardBookedBadge: { en: "Booked", ar: "محجوز" },
  // Empty State for Booking Options
  emptyBookingOptionsPrompt: { en: "Please select a date to view available slots.", ar: "الرجاء اختيار تاريخ لعرض الفترات المتاحة." },
  // Admin Section
  adminSectionToggleTitle: { en: "Manage Chalet Bookings & Prices", ar: "إدارة حجوزات وأسعار الشاليه" },
  adminSectionSelectDateTitle: { en: "Select Date to Manage:", ar: "اختر تاريخاً للإدارة:" },
  adminSectionManageTitle: { en: "Manage slots & prices for:", ar: "إدارة الفترات والأسعار ليوم:" },
  adminSectionClearBookingsButton: { en: "Clear All Bookings for this Date", ar: "مسح جميع الحجوزات لهذا التاريخ" },
  adminSectionMarkAvailableButton: { en: "Mark Available", ar: "تحديد كمتاح" },
  adminSectionMarkBookedButton: { en: "Mark Booked", ar: "تحديد كمحجوز" },
  adminSectionPriceLabel: { en: "Price:", ar: "السعر:" },
  adminSectionPricePlaceholderSuffix: { en: "(Default)", ar: "(الافتراضي)" },
  adminSectionSavePricesButton: { en: "Save Custom Prices for this Date", ar: "حفظ الأسعار المخصصة لهذا التاريخ" },
  adminSectionShowConfigButton: { en: "Show Configuration Data", ar: "إظهار بيانات الإعداد" },
  adminSectionHideConfigButton: { en: "Hide Configuration Data", ar: "إخفاء بيانات الإعداد" },
  adminSectionConfigInstructions: { en: "Copy the text below and paste it to replace the content of INITIAL_APP_CONFIG in your constants.tsx file to save these changes.", ar: "انسخ النص أدناه والصقه ليحل محل محتوى INITIAL_APP_CONFIG في ملف constants.tsx لحفظ هذه التغييرات." },
  
  // Enhanced Admin Range Pricing Section
  adminRangePricingSectionTitle: { en: "Apply Prices to Date Range", ar: "تطبيق الأسعار على نطاق تاريخي" },
  adminRangeStartDateLabel: { en: "Start Date:", ar: "تاريخ البدء:" },
  adminRangeEndDateLabel: { en: "End Date:", ar: "تاريخ الانتهاء:" },
  
  adminRangeWeekdayPricesTitle: { en: "Weekday Prices for Range (Sun-Wed, Thu Morn/Full)", ar: "أسعار أيام الأسبوع للنطاق (الأحد-الأربعاء، الخميس صباحًا/كامل)"},
  adminRangeWdMorningPriceLabel: { en: "Weekday Morning:", ar: "صباح أيام الأسبوع:"},
  adminRangeWdEveningPriceLabel: { en: "Weekday Evening (Sun-Wed):", ar: "مساء أيام الأسبوع (الأحد-الأربعاء):"},
  adminRangeWdFullDayPriceLabel: { en: "Weekday Full Day:", ar: "يوم كامل أيام الأسبوع:"},

  adminRangeWeekendPricesTitle: { en: "Weekend Prices for Range (Thu Eve, Fri, Sat)", ar: "أسعار عطلة نهاية الأسبوع للنطاق (مساء الخميس، الجمعة، السبت)"},
  adminRangeThuEvePriceLabel: { en: "Thursday Evening:", ar: "مساء الخميس:"},
  adminRangeFriMrnPriceLabel: { en: "Friday Morning:", ar: "صباح الجمعة:"},
  adminRangeFriEvePriceLabel: { en: "Friday Evening:", ar: "مساء الجمعة:"},
  adminRangeFriFullPriceLabel: { en: "Friday Full Day:", ar: "يوم الجمعة كامل:"},
  adminRangeSatMrnPriceLabel: { en: "Saturday Morning:", ar: "صباح السبت:"},
  adminRangeSatEvePriceLabel: { en: "Saturday Evening:", ar: "مساء السبت:"},
  adminRangeSatFullPriceLabel: { en: "Saturday Full Day:", ar: "يوم السبت كامل:"},

  adminRangeApplyButton: { en: "Apply Prices to Range", ar: "تطبيق الأسعار على النطاق" },
  adminRangePricePlaceholder: { en: "New price or leave blank", ar: "سعر جديد أو اتركه فارغاً" },
  adminRangeSuccessMessage: { en: "Prices updated for the selected range.", ar: "تم تحديث الأسعار للنطاق المحدد." },
  adminRangeErrorMessageDates: { en: "Please select a valid start and end date.", ar: "الرجاء اختيار تاريخ بدء وتاريخ انتهاء صالحين." },
  adminRangeErrorMessageNoPrices: { en: "Please enter at least one price to apply for the range.", ar: "الرجاء إدخال سعر واحد على الأقل للتطبيق على النطاق." },
  adminRangeErrorMessageDateOrder: { en: "End date must be on or after start date.", ar: "يجب أن يكون تاريخ الانتهاء في نفس يوم تاريخ البدء أو بعده." },

  // Alerts & Confirmations
  alertConfirmClearBookings: { en: "Are you sure you want to clear all bookings for", ar: "هل أنت متأكد أنك تريد مسح جميع الحجوزات ليوم" }, // Date will be appended
  alertPricesSaved: { en: "Prices saved for", ar: "تم حفظ الأسعار ليوم" }, // Date will be appended
  // Footer
  footerCopyright: { en: "Oriana Chalet Booking System.", ar: "نظام حجز شاليه أوريانا." },
  footerOwnerAccess: { en: "Owner Access.", ar: "وصول المالك." },
  footerEmployeeUse: { en: "For guest use.", ar: "للاستخدام كزائر." }, // Changed
  // Language Switcher
  langSwitchToEnglish: { en: "English", ar: "English" },
  langSwitchToArabic: { en: "العربية", ar: "العربية" },
  // Booking Option Details (used in constants.tsx)
  morningSlotTitle: { en: "Morning Slot", ar: "فترة صباحية" }, // Renamed and changed
  morningSessionTime: { en: "9:00 AM - 8:00 PM", ar: "٩:٠٠ صباحاً - ٨:٠٠ مساءً" }, // Time description remains
  eveningSlotTitle: { en: "Evening Slot", ar: "فترة مسائية" }, // Renamed and changed
  eveningSessionTime: { en: "9:00 PM - 8:00 AM (Next Day)", ar: "٩:٠٠ مساءً - ٨:٠٠ صباحاً (اليوم التالي)" }, // Time description remains
  fullDaySlotTitle: { en: "Full Day Slot", ar: "فترة يوم كامل" }, // Renamed and changed (was "Full Day Experience")
  fullDaySessionTime: { en: "10:00 AM - 8:00 AM (Next Day)", ar: "١٠:٠٠ صباحاً - ٨:٠٠ صباحاً (اليوم التالي)" }, // Time description remains
};

export type TranslationKey = keyof typeof translations;
export type Language = 'en' | 'ar';

export const getTranslation = (key: TranslationKey, lang: Language): string => {
  if (translations[key] && translations[key][lang]) {
    return translations[key][lang];
  }
  // Fallback to English or key if translation is missing
  return translations[key]?.en || key.toString();
};
