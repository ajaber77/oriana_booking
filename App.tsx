
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import BookingCard from './components/BookingCard';
import CalendarIcon from './components/icons/CalendarIcon';
import ChevronDownIcon from './components/icons/ChevronDownIcon';
import { INITIAL_APP_CONFIG, getBookingOptions } from './constants';
import { SlotType, BookedSlotsData, CustomPricesData, AppConfig, BookingOption } from './types';
import { getTranslation, Language, TranslationKey } from './locales';

interface AvailabilityStatus {
  morningAvailable: boolean;
  eveningAvailable: boolean;
  fullDayAvailable: boolean;
}

type UserRole = 'owner' | 'employee'; // 'employee' now means 'guest' for UI text
type CurrentView = 'pinEntry' | 'appView';

const OWNER_PIN = "200500"; 

const calculateDefaultPrice = (dateString: string, slotType: SlotType, lang: Language, bookingOptions: BookingOption[]): string => {
  if (!dateString) { 
    const fallbackOption = bookingOptions.find(op => op.id === slotType);
    return fallbackOption ? fallbackOption.price : "N/A";
  }
  const parts = dateString.split('-').map(Number);
  const date = new Date(parts[0], parts[1] - 1, parts[2]); 
  const dayOfWeek = date.getDay(); // 0 (Sunday) to 6 (Saturday)

  // Prices in JOD
  switch (slotType) {
    case SlotType.MORNING: // Sunday to Thursday Morning (Weekdays), Friday Morning, Saturday Morning
      if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday or Saturday Morning
        return "170 JOD";
      }
      return "150 JOD"; // Sunday to Thursday Morning
    case SlotType.EVENING: // Sunday to Wednesday Evening (Weekdays), Thursday Evening, Friday Evening, Saturday Evening
      if (dayOfWeek === 4 || dayOfWeek === 5 || dayOfWeek === 6) { // Thursday, Friday or Saturday Evening
        return "170 JOD";
      }
      return "150 JOD"; // Sunday to Wednesday Evening
    case SlotType.FULL_DAY: // Sunday to Thursday Full Day (Weekdays), Friday Full Day, Saturday Full Day
      if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday or Saturday Full Day
        return "270 JOD";
      }
      return "220 JOD"; // Sunday to Thursday Full Day
    default:
      const option = bookingOptions.find(op => op.id === slotType);
      return option ? option.price : "N/A";
  }
};


const getAvailabilityStatus = (selectedDate: string | null, currentBookedSlots: BookedSlotsData): AvailabilityStatus => {
  if (!selectedDate) {
    return { morningAvailable: true, eveningAvailable: true, fullDayAvailable: true };
  }
  const dailyBookings = currentBookedSlots[selectedDate];
  if (!dailyBookings || dailyBookings.length === 0) {
    return { morningAvailable: true, eveningAvailable: true, fullDayAvailable: true };
  }

  let morningAvailable = true;
  let eveningAvailable = true;
  let fullDayAvailable = true;

  if (dailyBookings.includes(SlotType.FULL_DAY)) {
    morningAvailable = false;
    eveningAvailable = false;
    fullDayAvailable = false;
  } else {
    if (dailyBookings.includes(SlotType.MORNING)) {
      morningAvailable = false;
    }
    if (dailyBookings.includes(SlotType.EVENING)) {
      eveningAvailable = false;
    }
    if (!morningAvailable || !eveningAvailable) {
        fullDayAvailable = false;
    }
  }
  return { morningAvailable, eveningAvailable, fullDayAvailable };
};


const App: React.FC = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('ar');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [managedBookedSlots, setManagedBookedSlots] = useState<BookedSlotsData>(INITIAL_APP_CONFIG.bookedSlots);
  const [managedCustomPrices, setManagedCustomPrices] = useState<CustomPricesData>(INITIAL_APP_CONFIG.customPrices);
  
  const [adminSelectedDate, setAdminSelectedDate] = useState<string | null>(null);
  const [showBookingDataJson, setShowBookingDataJson] = useState<boolean>(false);
  const [isAdminSectionOpen, setIsAdminSectionOpen] = useState<boolean>(false);
  
  const [userRole, setUserRole] = useState<UserRole>('employee'); 
  const [currentView, setCurrentView] = useState<CurrentView>('pinEntry');
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  const [tempAdminPrices, setTempAdminPrices] = useState<{[key: string]: string}>({});

  // State for date range pricing (granular)
  const [rangeStartDate, setRangeStartDate] = useState<string | null>(null);
  const [rangeEndDate, setRangeEndDate] = useState<string | null>(null);
  const [rangeUpdateStatus, setRangeUpdateStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [rangeWdMorningPrice, setRangeWdMorningPrice] = useState<string>('');
  const [rangeWdEveningPrice, setRangeWdEveningPrice] = useState<string>('');
  const [rangeWdFullDayPrice, setRangeWdFullDayPrice] = useState<string>('');
  const [rangeThuEvePrice, setRangeThuEvePrice] = useState<string>('');
  const [rangeFriMrnPrice, setRangeFriMrnPrice] = useState<string>('');
  const [rangeFriEvePrice, setRangeFriEvePrice] = useState<string>('');
  const [rangeFriFullPrice, setRangeFriFullPrice] = useState<string>('');
  const [rangeSatMrnPrice, setRangeSatMrnPrice] = useState<string>('');
  const [rangeSatEvePrice, setRangeSatEvePrice] = useState<string>('');
  const [rangeSatFullPrice, setRangeSatFullPrice] = useState<string>('');


  const t = useCallback((key: TranslationKey) => {
    return getTranslation(key, currentLanguage);
  }, [currentLanguage]);

  const bookingOptions = useMemo(() => getBookingOptions(currentLanguage), [currentLanguage]);

  useEffect(() => {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
  }, [currentLanguage]);

  const handleDateChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  }, []);

  const handleAdminDateChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    setAdminSelectedDate(newDate);
    if (newDate) {
        const pricesForDate: {[key: string]: string} = {};
        bookingOptions.forEach(opt => {
            pricesForDate[opt.id] = managedCustomPrices[newDate]?.[opt.id] || calculateDefaultPrice(newDate, opt.id, currentLanguage, bookingOptions);
        });
        setTempAdminPrices(pricesForDate);
    } else {
        setTempAdminPrices({});
    }
  }, [managedCustomPrices, currentLanguage, bookingOptions]);

  const availability = useMemo(() => {
    return getAvailabilityStatus(selectedDate, managedBookedSlots);
  }, [selectedDate, managedBookedSlots]);
  
  const adminDateCurrentBookings = useMemo(() => {
    if (!adminSelectedDate) return [];
    return managedBookedSlots[adminSelectedDate] || [];
  }, [adminSelectedDate, managedBookedSlots]);

  const isAdminDateBooked = useMemo(() => {
    return adminDateCurrentBookings.length > 0;
  }, [adminDateCurrentBookings]);


  const getCardAvailability = (slotId: SlotType): boolean => {
    switch (slotId) {
      case SlotType.MORNING:
        return availability.morningAvailable;
      case SlotType.EVENING:
        return availability.eveningAvailable;
      case SlotType.FULL_DAY:
        return availability.fullDayAvailable;
      default:
        return true;
    }
  };

  const getEffectivePrice = useCallback((date: string | null, slotId: SlotType): string => {
    if (!date) { 
        const defaultOption = bookingOptions.find(op => op.id === slotId);
        return defaultOption ? defaultOption.price : "N/A";
    }
    const dateCustomPrices = managedCustomPrices[date];
    if (dateCustomPrices && dateCustomPrices[slotId]) {
      return dateCustomPrices[slotId];
    }
    return calculateDefaultPrice(date, slotId, currentLanguage, bookingOptions);
  }, [managedCustomPrices, currentLanguage, bookingOptions]);

  const handleToggleBooking = useCallback((date: string, slotToToggle: SlotType) => {
    setManagedBookedSlots(prevSlots => {
      const newSlots = { ...prevSlots };
      let currentDayBookings = [...(newSlots[date] || [])];
      const isCurrentlyBooked = (slot: SlotType) => currentDayBookings.includes(slot);

      if (slotToToggle === SlotType.FULL_DAY) {
        if (isCurrentlyBooked(SlotType.FULL_DAY)) { 
          currentDayBookings = [];
        } else { 
          currentDayBookings = [SlotType.FULL_DAY]; 
        }
      } else { 
        if (isCurrentlyBooked(SlotType.FULL_DAY)) {
            currentDayBookings = currentDayBookings.filter(s => s !== SlotType.FULL_DAY); 
        }
        if (isCurrentlyBooked(slotToToggle)) { 
          currentDayBookings = currentDayBookings.filter(s => s !== slotToToggle); 
        } else { 
          currentDayBookings.push(slotToToggle); 
          currentDayBookings = [...new Set(currentDayBookings)]; 
        }
      }
      
      if (currentDayBookings.length === 0) {
        delete newSlots[date];
      } else {
        newSlots[date] = currentDayBookings;
      }
      return newSlots;
    });
  }, []);

  const handleClearAllBookingsForDate = useCallback((dateToClear: string) => {
    if (!dateToClear) return;
    const dateDisplay = new Date(dateToClear + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    if (window.confirm(`${t('alertConfirmClearBookings')} ${dateDisplay}?`)) {
        setManagedBookedSlots(prevSlots => {
            const newSlots = { ...prevSlots };
            delete newSlots[dateToClear];
            return newSlots;
        });
    }
  }, [t]); 
  
  const handleAdminSlotPriceInputChange = useCallback((slotId: SlotType, value: string) => {
    setTempAdminPrices(prev => ({...prev, [slotId]: value}));
  }, []);

  const handleSaveCustomPricesForDate = useCallback(() => {
    if (!adminSelectedDate) return;

    setManagedCustomPrices(prevCustomPrices => {
        const newCustomPrices = { ...prevCustomPrices };
        const dayPricesToSave: {[key: string]: string} = {};
        let hasCustomPriceForDay = false;

        bookingOptions.forEach(opt => {
            const currentPriceInInput = tempAdminPrices[opt.id];
            const dynamicDefaultPrice = calculateDefaultPrice(adminSelectedDate, opt.id, currentLanguage, bookingOptions);
            if (currentPriceInInput && currentPriceInInput.trim() !== '' && currentPriceInInput.trim() !== dynamicDefaultPrice) {
                dayPricesToSave[opt.id] = currentPriceInInput.trim();
                hasCustomPriceForDay = true;
            }
        });

        if (hasCustomPriceForDay) {
            newCustomPrices[adminSelectedDate] = dayPricesToSave;
        } else {
            delete newCustomPrices[adminSelectedDate];
        }
        return newCustomPrices;
    });
    const dateDisplay = new Date(adminSelectedDate + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    alert(`${t('alertPricesSaved')} ${dateDisplay}!`);
  }, [adminSelectedDate, tempAdminPrices, currentLanguage, t, bookingOptions]);

  const handleRangeInputChange = useCallback((setter: React.Dispatch<React.SetStateAction<any>>, value: string) => {
    setter(value);
    setRangeUpdateStatus(null); // Clear status on input change
  }, []);

  const handleApplyPricesToDateRange = useCallback(() => {
    setRangeUpdateStatus(null);
    if (!rangeStartDate || !rangeEndDate) {
      setRangeUpdateStatus({ message: t('adminRangeErrorMessageDates'), type: 'error' });
      return;
    }
    if (new Date(rangeStartDate) > new Date(rangeEndDate)) {
      setRangeUpdateStatus({ message: t('adminRangeErrorMessageDateOrder'), type: 'error' });
      return;
    }
    const allPricesEmpty = [
        rangeWdMorningPrice, rangeWdEveningPrice, rangeWdFullDayPrice,
        rangeThuEvePrice,
        rangeFriMrnPrice, rangeFriEvePrice, rangeFriFullPrice,
        rangeSatMrnPrice, rangeSatEvePrice, rangeSatFullPrice,
    ].every(price => !price.trim());

    if (allPricesEmpty) {
      setRangeUpdateStatus({ message: t('adminRangeErrorMessageNoPrices'), type: 'error' });
      return;
    }

    setManagedCustomPrices(prevCustomPrices => {
      const newCustomPrices = { ...prevCustomPrices };
      let currentDateIter = new Date(rangeStartDate + 'T00:00:00');
      const endDateObj = new Date(rangeEndDate + 'T00:00:00');

      while (currentDateIter <= endDateObj) {
        const dateString = currentDateIter.toISOString().split('T')[0];
        const dayOfWeek = currentDateIter.getDay(); // 0 (Sun) to 6 (Sat)
        
        let dateSpecificPrices = { ...(newCustomPrices[dateString] || {}) };
        
        const applyPriceForSlot = (slotType: SlotType, inputPrice: string) => {
            if (inputPrice.trim()) {
                const defaultPriceForSlot = calculateDefaultPrice(dateString, slotType, currentLanguage, bookingOptions);
                if (inputPrice.trim() === defaultPriceForSlot) {
                    delete dateSpecificPrices[slotType]; // Remove if same as default
                } else {
                    dateSpecificPrices[slotType] = inputPrice.trim();
                }
            }
        };

        // Apply prices based on day of week and slot type
        if (dayOfWeek === 4) { // Thursday
            applyPriceForSlot(SlotType.MORNING, rangeWdMorningPrice); // Thu Morning uses weekday morning price
            applyPriceForSlot(SlotType.EVENING, rangeThuEvePrice);    // Thu Evening uses specific Thu Evening price
            applyPriceForSlot(SlotType.FULL_DAY, rangeWdFullDayPrice); // Thu Full Day uses weekday full day price
        } else if (dayOfWeek === 5) { // Friday
            applyPriceForSlot(SlotType.MORNING, rangeFriMrnPrice);
            applyPriceForSlot(SlotType.EVENING, rangeFriEvePrice);
            applyPriceForSlot(SlotType.FULL_DAY, rangeFriFullPrice);
        } else if (dayOfWeek === 6) { // Saturday
            applyPriceForSlot(SlotType.MORNING, rangeSatMrnPrice);
            applyPriceForSlot(SlotType.EVENING, rangeSatEvePrice);
            applyPriceForSlot(SlotType.FULL_DAY, rangeSatFullPrice);
        } else { // Sunday, Monday, Tuesday, Wednesday (Weekdays)
            applyPriceForSlot(SlotType.MORNING, rangeWdMorningPrice);
            applyPriceForSlot(SlotType.EVENING, rangeWdEveningPrice);
            applyPriceForSlot(SlotType.FULL_DAY, rangeWdFullDayPrice);
        }

        if (Object.keys(dateSpecificPrices).length > 0) {
          newCustomPrices[dateString] = dateSpecificPrices;
        } else {
          delete newCustomPrices[dateString]; // Clean up if no custom prices for this date
        }
        currentDateIter.setDate(currentDateIter.getDate() + 1);
      }
      return newCustomPrices;
    });

    setRangeUpdateStatus({ message: t('adminRangeSuccessMessage'), type: 'success' });
  }, [
      rangeStartDate, rangeEndDate, 
      rangeWdMorningPrice, rangeWdEveningPrice, rangeWdFullDayPrice,
      rangeThuEvePrice, 
      rangeFriMrnPrice, rangeFriEvePrice, rangeFriFullPrice,
      rangeSatMrnPrice, rangeSatEvePrice, rangeSatFullPrice,
      t, currentLanguage, bookingOptions
  ]);


  const today = new Date().toISOString().split('T')[0];

  const handlePinInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPinInput(event.target.value);
    setPinError(null); 
  };

  const handlePinSubmit = () => {
    if (pinInput === OWNER_PIN) {
      setUserRole('owner');
      setCurrentView('appView');
      setPinError(null);
    } else {
      setPinError(t('pinEntryInvalidPin'));
    }
    setPinInput(''); 
  };

  const handleContinueAsEmployee = () => { 
    setUserRole('employee'); 
    setCurrentView('appView');
    setPinInput('');
    setPinError(null);
  };
  
  const LanguageSwitcher = () => (
    <div className="flex justify-center space-x-2 rtl:space-x-reverse my-4">
      <button
        onClick={() => setCurrentLanguage('en')}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${currentLanguage === 'en' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
      >
        {t('langSwitchToEnglish')}
      </button>
      <button
        onClick={() => setCurrentLanguage('ar')}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${currentLanguage === 'ar' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
      >
        {t('langSwitchToArabic')}
      </button>
    </div>
  );

  if (currentView === 'pinEntry') {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col items-center justify-center p-4" dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-2xl text-center">
          <h1 className="text-3xl font-bold text-purple-700 mb-2 mt-6">{t('pinEntryTitle')}</h1>
          <p className="text-purple-600 mb-6">{t('pinEntrySubtitle')}</p>
          
          <input
            type="password"
            value={pinInput}
            onChange={handlePinInputChange}
            placeholder={t('pinEntryPlaceholder')}
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors duration-200 text-lg text-center"
            aria-label={t('pinEntryPlaceholder')}
          />
          {pinError && (
            <p className="text-red-600 text-sm mb-4">{pinError}</p>
          )}
          <button
            onClick={handlePinSubmit}
            className="w-full p-3 mb-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold transition-colors"
          >
            {t('pinEntryLoginOwner')}
          </button>
          <button
            onClick={handleContinueAsEmployee} 
            className="w-full p-3 bg-gray-300 hover:bg-gray-400 rounded-lg text-gray-800 font-semibold transition-colors"
          >
            {t('pinEntryContinueEmployee')} 
          </button>
        </div>
        <LanguageSwitcher />
        <footer className="mt-8 text-center text-sm text-purple-600 opacity-70">
            <p>&copy; {new Date().getFullYear()} {t('footerCopyright')}</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center p-4 sm:p-6 md:p-8" dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
      <header className="text-center mb-10 mt-4 w-full">
         <div className="absolute top-4 start-4"> <LanguageSwitcher /></div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-purple-700">
          {t('appHeaderTitle')}
        </h1>
        <p className="text-lg text-purple-600 mt-2">
          {userRole === 'owner' ? t('appHeaderSubtitleOwner') : t('appHeaderSubtitleEmployee')}
        </p>
      </header>

      <section className="w-full max-w-md bg-gray-50 p-6 rounded-xl shadow-xl mb-10">
        <h2 className="text-2xl font-semibold text-purple-700 mb-4 flex items-center">
          <CalendarIcon className="w-7 h-7 me-3 text-purple-500" />
          {t('dateSelectionTitle')}
        </h2>
        <input
          type="date"
          value={selectedDate || ''}
          min={today}
          onChange={handleDateChange}
          className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors duration-200 text-lg"
          aria-label={t('dateSelectionTitle')}
        />
        {selectedDate && (
           <p className="mt-3 text-sm text-gray-700">{t('dateSelectionSelectedDateLabel')} {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        )}
      </section>

      {selectedDate ? (
        <section className="w-full max-w-5xl">
          <h2 className="text-3xl font-semibold text-center text-purple-700 mb-8">{t('bookingOptionsTitle')} {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</h2>
          <div className="flex flex-wrap justify-center items-stretch gap-4 md:gap-6">
            {bookingOptions.map((option) => (
              <BookingCard
                key={option.id}
                icon={option.icon}
                title={option.title} 
                time={option.time}
                price={getEffectivePrice(selectedDate, option.id)}
                isAvailable={getCardAvailability(option.id)}
                bookedText={t('bookingCardBookedBadge')}
              />
            ))}
          </div>
        </section>
      ) : (
        <div className="text-center mt-8 p-8 bg-gray-100 rounded-xl shadow-xl max-w-md">
            <CalendarIcon className="w-16 h-16 text-purple-500 mx-auto mb-4 opacity-50"/>
            <p className="text-xl text-gray-700">{t('emptyBookingOptionsPrompt')}</p>
        </div>
      )}

      {userRole === 'owner' && (
        <section className="w-full max-w-2xl bg-gray-50 p-6 rounded-xl shadow-xl mt-12">
          <button
            onClick={() => setIsAdminSectionOpen(!isAdminSectionOpen)}
            className="w-full flex justify-between items-center text-start text-2xl font-semibold text-purple-700 mb-4 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            aria-expanded={isAdminSectionOpen}
          >
            {t('adminSectionToggleTitle')}
            <ChevronDownIcon className={`w-6 h-6 transform transition-transform duration-300 ${isAdminSectionOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isAdminSectionOpen && (
            <div className="mt-4 space-y-8"> {/* Increased spacing between admin subsections */}
              {/* Single Date Management */}
              <div>
                <h3 className="text-xl font-medium text-purple-700 mb-3 flex items-center">
                  <CalendarIcon className="w-6 h-6 me-2" />
                  {t('adminSectionSelectDateTitle')}
                </h3>
                <input
                  type="date"
                  value={adminSelectedDate || ''}
                  min={today}
                  onChange={handleAdminDateChange}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors duration-200 text-lg"
                  aria-label={t('adminSectionSelectDateTitle')}
                />
              </div>

              {adminSelectedDate && (
                <div className="space-y-4 p-4 bg-gray-100 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">{t('adminSectionManageTitle')} {new Date(adminSelectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h4>
                  
                  {isAdminDateBooked && (
                     <button
                        onClick={() => handleClearAllBookingsForDate(adminSelectedDate)}
                        className="w-full mb-4 p-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition-colors text-sm"
                     >
                        {t('adminSectionClearBookingsButton')}
                     </button>
                  )}
                 
                  {bookingOptions.map(opt => {
                    const slot = opt.id;
                    let effectiveSlotBooked = false;
                    const bookingsForAdminDate = managedBookedSlots[adminSelectedDate] || [];

                    if (slot === SlotType.FULL_DAY) {
                      effectiveSlotBooked = bookingsForAdminDate.includes(SlotType.FULL_DAY);
                    } else if (slot === SlotType.MORNING) {
                      effectiveSlotBooked = bookingsForAdminDate.includes(SlotType.FULL_DAY) || bookingsForAdminDate.includes(SlotType.MORNING);
                    } else if (slot === SlotType.EVENING) {
                      effectiveSlotBooked = bookingsForAdminDate.includes(SlotType.FULL_DAY) || bookingsForAdminDate.includes(SlotType.EVENING);
                    }
                    
                    const dynamicDefaultPriceForSlot = calculateDefaultPrice(adminSelectedDate, opt.id, currentLanguage, bookingOptions);

                    return (
                      <div key={slot} className="p-3 bg-white border border-gray-200 rounded-md space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-800 font-medium">{opt.title}</span>
                            <button
                              onClick={() => handleToggleBooking(adminSelectedDate, slot)}
                              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                                ${effectiveSlotBooked ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                            >
                              {effectiveSlotBooked ? t('adminSectionMarkAvailableButton') : t('adminSectionMarkBookedButton')}
                            </button>
                        </div>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <label htmlFor={`price-${slot}`} className="text-sm text-gray-600 w-auto whitespace-nowrap me-2">{t('adminSectionPriceLabel')}</label>
                            <input
                                type="text"
                                id={`price-${slot}`}
                                value={tempAdminPrices[slot] || ''}
                                placeholder={`${dynamicDefaultPriceForSlot} ${t('adminSectionPricePlaceholderSuffix')}`}
                                onChange={(e) => handleAdminSlotPriceInputChange(slot, e.target.value)}
                                className="flex-1 p-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                            />
                        </div>
                      </div>
                    );
                  })}
                  <button
                    onClick={handleSaveCustomPricesForDate}
                    className="w-full mt-4 p-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors"
                  >
                    {t('adminSectionSavePricesButton')}
                  </button>
                </div>
              )}

              {/* Enhanced Date Range Pricing Section */}
              <div className="p-4 bg-gray-100 rounded-lg space-y-6">
                  <h3 className="text-xl font-medium text-purple-700 mb-3">{t('adminRangePricingSectionTitle')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="rangeStartDate" className="block text-sm font-medium text-gray-700 mb-1">{t('adminRangeStartDateLabel')}</label>
                        <input type="date" id="rangeStartDate" value={rangeStartDate || ''} min={today} onChange={(e) => handleRangeInputChange(setRangeStartDate, e.target.value)}
                               className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"/>
                    </div>
                    <div>
                        <label htmlFor="rangeEndDate" className="block text-sm font-medium text-gray-700 mb-1">{t('adminRangeEndDateLabel')}</label>
                        <input type="date" id="rangeEndDate" value={rangeEndDate || ''} min={rangeStartDate || today} onChange={(e) => handleRangeInputChange(setRangeEndDate, e.target.value)}
                               className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"/>
                    </div>
                  </div>

                  {/* Weekday Prices */}
                  <div className="space-y-3 p-3 border border-gray-200 rounded-md bg-white/50">
                    <h4 className="text-md font-semibold text-gray-700">{t('adminRangeWeekdayPricesTitle')}</h4>
                    <div>
                        <label htmlFor="rangeWdMorningPrice" className="block text-xs font-medium text-gray-600 mb-0.5">{t('adminRangeWdMorningPriceLabel')}</label>
                        <input type="text" id="rangeWdMorningPrice" value={rangeWdMorningPrice} onChange={(e) => handleRangeInputChange(setRangeWdMorningPrice, e.target.value)}
                               placeholder={t('adminRangePricePlaceholder')}
                               className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"/>
                    </div>
                    <div>
                        <label htmlFor="rangeWdEveningPrice" className="block text-xs font-medium text-gray-600 mb-0.5">{t('adminRangeWdEveningPriceLabel')}</label>
                        <input type="text" id="rangeWdEveningPrice" value={rangeWdEveningPrice} onChange={(e) => handleRangeInputChange(setRangeWdEveningPrice, e.target.value)}
                               placeholder={t('adminRangePricePlaceholder')}
                               className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"/>
                    </div>
                    <div>
                        <label htmlFor="rangeWdFullDayPrice" className="block text-xs font-medium text-gray-600 mb-0.5">{t('adminRangeWdFullDayPriceLabel')}</label>
                        <input type="text" id="rangeWdFullDayPrice" value={rangeWdFullDayPrice} onChange={(e) => handleRangeInputChange(setRangeWdFullDayPrice, e.target.value)}
                               placeholder={t('adminRangePricePlaceholder')}
                               className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"/>
                    </div>
                  </div>

                  {/* Weekend Prices */}
                  <div className="space-y-3 p-3 border border-gray-200 rounded-md bg-white/50">
                    <h4 className="text-md font-semibold text-gray-700">{t('adminRangeWeekendPricesTitle')}</h4>
                    <div>
                        <label htmlFor="rangeThuEvePrice" className="block text-xs font-medium text-gray-600 mb-0.5">{t('adminRangeThuEvePriceLabel')}</label>
                        <input type="text" id="rangeThuEvePrice" value={rangeThuEvePrice} onChange={(e) => handleRangeInputChange(setRangeThuEvePrice, e.target.value)}
                               placeholder={t('adminRangePricePlaceholder')}
                               className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"/>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                            <label htmlFor="rangeFriMrnPrice" className="block text-xs font-medium text-gray-600 mb-0.5">{t('adminRangeFriMrnPriceLabel')}</label>
                            <input type="text" id="rangeFriMrnPrice" value={rangeFriMrnPrice} onChange={(e) => handleRangeInputChange(setRangeFriMrnPrice, e.target.value)} placeholder={t('adminRangePricePlaceholder')}
                                   className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"/>
                        </div>
                        <div>
                            <label htmlFor="rangeFriEvePrice" className="block text-xs font-medium text-gray-600 mb-0.5">{t('adminRangeFriEvePriceLabel')}</label>
                            <input type="text" id="rangeFriEvePrice" value={rangeFriEvePrice} onChange={(e) => handleRangeInputChange(setRangeFriEvePrice, e.target.value)} placeholder={t('adminRangePricePlaceholder')}
                                   className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"/>
                        </div>
                        <div>
                            <label htmlFor="rangeFriFullPrice" className="block text-xs font-medium text-gray-600 mb-0.5">{t('adminRangeFriFullPriceLabel')}</label>
                            <input type="text" id="rangeFriFullPrice" value={rangeFriFullPrice} onChange={(e) => handleRangeInputChange(setRangeFriFullPrice, e.target.value)} placeholder={t('adminRangePricePlaceholder')}
                                   className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"/>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                            <label htmlFor="rangeSatMrnPrice" className="block text-xs font-medium text-gray-600 mb-0.5">{t('adminRangeSatMrnPriceLabel')}</label>
                            <input type="text" id="rangeSatMrnPrice" value={rangeSatMrnPrice} onChange={(e) => handleRangeInputChange(setRangeSatMrnPrice, e.target.value)} placeholder={t('adminRangePricePlaceholder')}
                                   className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"/>
                        </div>
                        <div>
                            <label htmlFor="rangeSatEvePrice" className="block text-xs font-medium text-gray-600 mb-0.5">{t('adminRangeSatEvePriceLabel')}</label>
                            <input type="text" id="rangeSatEvePrice" value={rangeSatEvePrice} onChange={(e) => handleRangeInputChange(setRangeSatEvePrice, e.target.value)} placeholder={t('adminRangePricePlaceholder')}
                                   className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"/>
                        </div>
                        <div>
                            <label htmlFor="rangeSatFullPrice" className="block text-xs font-medium text-gray-600 mb-0.5">{t('adminRangeSatFullPriceLabel')}</label>
                            <input type="text" id="rangeSatFullPrice" value={rangeSatFullPrice} onChange={(e) => handleRangeInputChange(setRangeSatFullPrice, e.target.value)} placeholder={t('adminRangePricePlaceholder')}
                                   className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"/>
                        </div>
                    </div>
                  </div>
                  
                  <button onClick={handleApplyPricesToDateRange}
                          className="w-full p-2.5 bg-teal-600 hover:bg-teal-700 rounded-lg text-white font-semibold transition-colors">
                      {t('adminRangeApplyButton')}
                  </button>
                  {rangeUpdateStatus && (
                      <p className={`mt-2 text-sm ${rangeUpdateStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                          {rangeUpdateStatus.message}
                      </p>
                  )}
              </div>


              {/* Configuration Data Section */}
              <div className="mt-8 pt-6 border-t border-gray-300"> {/* Added more spacing and a separator */}
                  <button
                      onClick={() => setShowBookingDataJson(!showBookingDataJson)}
                      className="w-full p-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold transition-colors mb-2"
                  >
                      {showBookingDataJson ? t('adminSectionHideConfigButton') : t('adminSectionShowConfigButton')}
                  </button>
                  {showBookingDataJson && (
                      <div className="p-4 bg-gray-100 rounded-lg">
                          <p className="text-sm text-gray-700 mb-2">
                              {t('adminSectionConfigInstructions')}
                          </p>
                          <textarea
                              readOnly
                              value={JSON.stringify({ bookedSlots: managedBookedSlots, customPrices: managedCustomPrices }, null, 2)}
                              className="w-full h-60 p-2 border border-gray-300 rounded-md bg-white text-gray-900 text-xs font-mono"
                              aria-label="Current application configuration data"
                              dir="ltr" 
                          />
                      </div>
                  )}
              </div>
            </div>
          )}
        </section>
      )}

      <footer className="mt-12 text-center text-sm text-gray-600 opacity-70">
        <p>&copy; {new Date().getFullYear()} {t('footerCopyright')} {userRole === 'owner' ? t('footerOwnerAccess') : t('footerEmployeeUse')}</p>
      </footer>
    </div>
  );
};

export default App;
