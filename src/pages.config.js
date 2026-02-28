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
import AIItineraryPlanner from './pages/AIItineraryPlanner';
import AdminAds from './pages/AdminAds';
import AdminAdvertisements from './pages/AdminAdvertisements';
import AdminAffiliates from './pages/AdminAffiliates';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminAuditLogs from './pages/AdminAuditLogs';
import AdminBankAccounts from './pages/AdminBankAccounts';
import AdminBuses from './pages/AdminBuses';
import AdminCarRentals from './pages/AdminCarRentals';
import AdminCodeBackup from './pages/AdminCodeBackup';
import AdminCorporateClients from './pages/AdminCorporateClients';
import AdminCtripIntegration from './pages/AdminCtripIntegration';
import AdminDashboard from './pages/AdminDashboard';
import AdminDataManager from './pages/AdminDataManager';
import AdminEmailClients from './pages/AdminEmailClients';
import AdminFerries from './pages/AdminFerries';
import AdminFlights from './pages/AdminFlights';
import AdminHelpdesk from './pages/AdminHelpdesk';
import AdminHotels from './pages/AdminHotels';
import AdminInsurance from './pages/AdminInsurance';
import AdminInsuranceProviders from './pages/AdminInsuranceProviders';
import AdminLoyalty from './pages/AdminLoyalty';
import AdminMonetization from './pages/AdminMonetization';
import AdminPackagePromoCodes from './pages/AdminPackagePromoCodes';
import AdminPackageSales from './pages/AdminPackageSales';
import AdminPackages from './pages/AdminPackages';
import AdminPricing from './pages/AdminPricing';
import AdminPromotions from './pages/AdminPromotions';
import AdminReviews from './pages/AdminReviews';
import AdminSalesTeam from './pages/AdminSalesTeam';
import AdminSecurityCenter from './pages/AdminSecurityCenter';
import AdminSupplierBankAccounts from './pages/AdminSupplierBankAccounts';
import AdminSupplierComms from './pages/AdminSupplierComms';
import AdminSupplierPayments from './pages/AdminSupplierPayments';
import AdminTours from './pages/AdminTours';
import AdminVisas from './pages/AdminVisas';
import AffiliateDashboard from './pages/AffiliateDashboard';
import BestPriceGuarantee from './pages/BestPriceGuarantee';
import BookingConfirmation from './pages/BookingConfirmation';
import BusSearch from './pages/BusSearch';
import CarRentalSearch from './pages/CarRentalSearch';
import Contact from './pages/Contact';
import CorporateBooking from './pages/CorporateBooking';
import CruiseSearch from './pages/CruiseSearch';
import FerrySearch from './pages/FerrySearch';
import FlightDetail from './pages/FlightDetail';
import FlightSearch from './pages/FlightSearch';
import FlightTicket from './pages/FlightTicket';
import Flights from './pages/Flights';
import GDPRSettings from './pages/GDPRSettings';
import Helpdesk from './pages/Helpdesk';
import Home from './pages/Home';
import HotelBookingConfirmation from './pages/HotelBookingConfirmation';
import HotelDetail from './pages/HotelDetail';
import HotelSearch from './pages/HotelSearch';
import Hotels from './pages/Hotels';
import Itineraries from './pages/Itineraries';
import ItineraryView from './pages/ItineraryView';
import LogoGenerator from './pages/LogoGenerator';
import ManageReservations from './pages/ManageReservations';
import Messages from './pages/Messages';
import MyBookings from './pages/MyBookings';
import MyFlightBookings from './pages/MyFlightBookings';
import MyPackages from './pages/MyPackages';
import MyReviews from './pages/MyReviews';
import PackageBookingSuccess from './pages/PackageBookingSuccess';
import PackageBuilder from './pages/PackageBuilder';
import Packages from './pages/Packages';
import PaymentCancelled from './pages/PaymentCancelled';
import PaymentMethods from './pages/PaymentMethods';
import PaymentSuccess from './pages/PaymentSuccess';
import PremiumMembership from './pages/PremiumMembership';
import PriceAlerts from './pages/PriceAlerts';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Profile from './pages/Profile';
import RefundPolicy from './pages/RefundPolicy';
import SafeAndSecure from './pages/SafeAndSecure';
import SalesDashboard from './pages/SalesDashboard';
import Settings from './pages/Settings';
import SharedItinerary from './pages/SharedItinerary';
import SupplierDashboard from './pages/SupplierDashboard';
import SupplierLogin from './pages/SupplierLogin';
import SupplierOnboarding from './pages/SupplierOnboarding';
import Support247 from './pages/Support247';
import TermsOfService from './pages/TermsOfService';
import TourDetail from './pages/TourDetail';
import Tours from './pages/Tours';
import TrainBookingConfirmation from './pages/TrainBookingConfirmation';
import TrainSearch from './pages/TrainSearch';
import TransactionHistory from './pages/TransactionHistory';
import TravelAlerts from './pages/TravelAlerts';
import TravelAssistant from './pages/TravelAssistant';
import TravelInsurance from './pages/TravelInsurance';
import TrustedAgency from './pages/TrustedAgency';
import Visas from './pages/Visas';
import utils from './pages/utils';
import BiyahekoPortal from './pages/BiyahekoPortal';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIItineraryPlanner": AIItineraryPlanner,
    "AdminAds": AdminAds,
    "AdminAdvertisements": AdminAdvertisements,
    "AdminAffiliates": AdminAffiliates,
    "AdminAnalytics": AdminAnalytics,
    "AdminAuditLogs": AdminAuditLogs,
    "AdminBankAccounts": AdminBankAccounts,
    "AdminBuses": AdminBuses,
    "AdminCarRentals": AdminCarRentals,
    "AdminCodeBackup": AdminCodeBackup,
    "AdminCorporateClients": AdminCorporateClients,
    "AdminCtripIntegration": AdminCtripIntegration,
    "AdminDashboard": AdminDashboard,
    "AdminDataManager": AdminDataManager,
    "AdminEmailClients": AdminEmailClients,
    "AdminFerries": AdminFerries,
    "AdminFlights": AdminFlights,
    "AdminHelpdesk": AdminHelpdesk,
    "AdminHotels": AdminHotels,
    "AdminInsurance": AdminInsurance,
    "AdminInsuranceProviders": AdminInsuranceProviders,
    "AdminLoyalty": AdminLoyalty,
    "AdminMonetization": AdminMonetization,
    "AdminPackagePromoCodes": AdminPackagePromoCodes,
    "AdminPackageSales": AdminPackageSales,
    "AdminPackages": AdminPackages,
    "AdminPricing": AdminPricing,
    "AdminPromotions": AdminPromotions,
    "AdminReviews": AdminReviews,
    "AdminSalesTeam": AdminSalesTeam,
    "AdminSecurityCenter": AdminSecurityCenter,
    "AdminSupplierBankAccounts": AdminSupplierBankAccounts,
    "AdminSupplierComms": AdminSupplierComms,
    "AdminSupplierPayments": AdminSupplierPayments,
    "AdminTours": AdminTours,
    "AdminVisas": AdminVisas,
    "AffiliateDashboard": AffiliateDashboard,
    "BestPriceGuarantee": BestPriceGuarantee,
    "BookingConfirmation": BookingConfirmation,
    "BusSearch": BusSearch,
    "CarRentalSearch": CarRentalSearch,
    "Contact": Contact,
    "CorporateBooking": CorporateBooking,
    "CruiseSearch": CruiseSearch,
    "FerrySearch": FerrySearch,
    "FlightDetail": FlightDetail,
    "FlightSearch": FlightSearch,
    "FlightTicket": FlightTicket,
    "Flights": Flights,
    "GDPRSettings": GDPRSettings,
    "Helpdesk": Helpdesk,
    "Home": Home,
    "HotelBookingConfirmation": HotelBookingConfirmation,
    "HotelDetail": HotelDetail,
    "HotelSearch": HotelSearch,
    "Hotels": Hotels,
    "Itineraries": Itineraries,
    "ItineraryView": ItineraryView,
    "LogoGenerator": LogoGenerator,
    "ManageReservations": ManageReservations,
    "Messages": Messages,
    "MyBookings": MyBookings,
    "MyFlightBookings": MyFlightBookings,
    "MyPackages": MyPackages,
    "MyReviews": MyReviews,
    "PackageBookingSuccess": PackageBookingSuccess,
    "PackageBuilder": PackageBuilder,
    "Packages": Packages,
    "PaymentCancelled": PaymentCancelled,
    "PaymentMethods": PaymentMethods,
    "PaymentSuccess": PaymentSuccess,
    "PremiumMembership": PremiumMembership,
    "PriceAlerts": PriceAlerts,
    "PrivacyPolicy": PrivacyPolicy,
    "Profile": Profile,
    "RefundPolicy": RefundPolicy,
    "SafeAndSecure": SafeAndSecure,
    "SalesDashboard": SalesDashboard,
    "Settings": Settings,
    "SharedItinerary": SharedItinerary,
    "SupplierDashboard": SupplierDashboard,
    "SupplierLogin": SupplierLogin,
    "SupplierOnboarding": SupplierOnboarding,
    "Support247": Support247,
    "TermsOfService": TermsOfService,
    "TourDetail": TourDetail,
    "Tours": Tours,
    "TrainBookingConfirmation": TrainBookingConfirmation,
    "TrainSearch": TrainSearch,
    "TransactionHistory": TransactionHistory,
    "TravelAlerts": TravelAlerts,
    "TravelAssistant": TravelAssistant,
    "TravelInsurance": TravelInsurance,
    "TrustedAgency": TrustedAgency,
    "Visas": Visas,
    "utils": utils,
    "BiyahekoPortal": BiyahekoPortal,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};