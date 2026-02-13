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
import BookingConfirmation from './pages/BookingConfirmation';
import FlightDetail from './pages/FlightDetail';
import FlightSearch from './pages/FlightSearch';
import Flights from './pages/Flights';
import Home from './pages/Home';
import HotelDetail from './pages/HotelDetail';
import Hotels from './pages/Hotels';
import Itineraries from './pages/Itineraries';
import ItineraryView from './pages/ItineraryView';
import MyBookings from './pages/MyBookings';
import MyFlightBookings from './pages/MyFlightBookings';
import Profile from './pages/Profile';
import SharedItinerary from './pages/SharedItinerary';
import TourDetail from './pages/TourDetail';
import Tours from './pages/Tours';
import utils from './pages/utils';
import HotelSearch from './pages/HotelSearch';
import HotelBookingConfirmation from './pages/HotelBookingConfirmation';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "BookingConfirmation": BookingConfirmation,
    "FlightDetail": FlightDetail,
    "FlightSearch": FlightSearch,
    "Flights": Flights,
    "Home": Home,
    "HotelDetail": HotelDetail,
    "Hotels": Hotels,
    "Itineraries": Itineraries,
    "ItineraryView": ItineraryView,
    "MyBookings": MyBookings,
    "MyFlightBookings": MyFlightBookings,
    "Profile": Profile,
    "SharedItinerary": SharedItinerary,
    "TourDetail": TourDetail,
    "Tours": Tours,
    "utils": utils,
    "HotelSearch": HotelSearch,
    "HotelBookingConfirmation": HotelBookingConfirmation,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};