/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdminDashboard from './pages/AdminDashboard';
import AdminFlights from './pages/AdminFlights';
import AdminHotels from './pages/AdminHotels';
import AdminReviews from './pages/AdminReviews';
import AdminTours from './pages/AdminTours';
import BookingConfirmation from './pages/BookingConfirmation';
import Contact from './pages/Contact';
import FlightDetail from './pages/FlightDetail';
import FlightSearch from './pages/FlightSearch';
import FlightTicket from './pages/FlightTicket';
import Flights from './pages/Flights';
import Home from './pages/Home';
import HotelBookingConfirmation from './pages/HotelBookingConfirmation';
import HotelDetail from './pages/HotelDetail';
import HotelSearch from './pages/HotelSearch';
import Hotels from './pages/Hotels';
import Itineraries from './pages/Itineraries';
import ItineraryView from './pages/ItineraryView';
import MyBookings from './pages/MyBookings';
import MyFlightBookings from './pages/MyFlightBookings';
import MyReviews from './pages/MyReviews';
import PriceAlerts from './pages/PriceAlerts';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Profile from './pages/Profile';
import RefundPolicy from './pages/RefundPolicy';
import Settings from './pages/Settings';
import SharedItinerary from './pages/SharedItinerary';
import TermsOfService from './pages/TermsOfService';
import TourDetail from './pages/TourDetail';
import Tours from './pages/Tours';
import utils from './pages/utils';
import AdminFerries from './pages/AdminFerries';
import AdminBuses from './pages/AdminBuses';
import AdminVisas from './pages/AdminVisas';
import AdminLoyalty from './pages/AdminLoyalty';
import AdminBankAccounts from './pages/AdminBankAccounts';
import AdminSupplierPayments from './pages/AdminSupplierPayments';
import AdminSupplierBankAccounts from './pages/AdminSupplierBankAccounts';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminDashboard": AdminDashboard,
    "AdminFlights": AdminFlights,
    "AdminHotels": AdminHotels,
    "AdminReviews": AdminReviews,
    "AdminTours": AdminTours,
    "BookingConfirmation": BookingConfirmation,
    "Contact": Contact,
    "FlightDetail": FlightDetail,
    "FlightSearch": FlightSearch,
    "FlightTicket": FlightTicket,
    "Flights": Flights,
    "Home": Home,
    "HotelBookingConfirmation": HotelBookingConfirmation,
    "HotelDetail": HotelDetail,
    "HotelSearch": HotelSearch,
    "Hotels": Hotels,
    "Itineraries": Itineraries,
    "ItineraryView": ItineraryView,
    "MyBookings": MyBookings,
    "MyFlightBookings": MyFlightBookings,
    "MyReviews": MyReviews,
    "PriceAlerts": PriceAlerts,
    "PrivacyPolicy": PrivacyPolicy,
    "Profile": Profile,
    "RefundPolicy": RefundPolicy,
    "Settings": Settings,
    "SharedItinerary": SharedItinerary,
    "TermsOfService": TermsOfService,
    "TourDetail": TourDetail,
    "Tours": Tours,
    "utils": utils,
    "AdminFerries": AdminFerries,
    "AdminBuses": AdminBuses,
    "AdminVisas": AdminVisas,
    "AdminLoyalty": AdminLoyalty,
    "AdminBankAccounts": AdminBankAccounts,
    "AdminSupplierPayments": AdminSupplierPayments,
    "AdminSupplierBankAccounts": AdminSupplierBankAccounts,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};