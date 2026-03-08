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
import AdminAdCampaigns from './pages/AdminAdCampaigns';
import AdminAds from './pages/AdminAds';
import AdminAdvertisements from './pages/AdminAdvertisements';
import AdminAffiliateAnalytics from './pages/AdminAffiliateAnalytics';
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
import AdminDigitalStore from './pages/AdminDigitalStore';
import AdminEmailClients from './pages/AdminEmailClients';
import AdminFerries from './pages/AdminFerries';
import AdminFlights from './pages/AdminFlights';
import AdminHelpdesk from './pages/AdminHelpdesk';
import AdminHotels from './pages/AdminHotels';
import AdminInsurance from './pages/AdminInsurance';
import AdminInsuranceProviders from './pages/AdminInsuranceProviders';
import AdminInventoryMonitor from './pages/AdminInventoryMonitor';
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
import BiyahekoPortal from './pages/BiyahekoPortal';
import BusCheckout from './pages/BusCheckout';
import CarRentalCheckout from './pages/CarRentalCheckout';
import CorporateBooking from './pages/CorporateBooking';
import CruiseCheckout from './pages/CruiseCheckout';
import DatabaseSchema from './pages/DatabaseSchema';
import DigitalStore from './pages/DigitalStore';
import FerryCheckout from './pages/FerryCheckout';
import FinitechArchitecture from './pages/FinitechArchitecture';
import HotelCheckout from './pages/HotelCheckout';
import LogoGenerator from './pages/LogoGenerator';
import RegulatoryChecklist from './pages/RegulatoryChecklist';
import SalesDashboard from './pages/SalesDashboard';
import SupplierDashboard from './pages/SupplierDashboard';
import SupplierLogin from './pages/SupplierLogin';
import SupplierOnboarding from './pages/SupplierOnboarding';
import TawkSupport from './pages/TawkSupport';
import TourCheckout from './pages/TourCheckout';
import TourDetail from './pages/TourDetail';
import TrainBookingConfirmation from './pages/TrainBookingConfirmation';
import TrainCheckout from './pages/TrainCheckout';
import TripzynxPortal from './pages/TripzynxPortal';
import TrustedAgency from './pages/TrustedAgency';
import TwelveGoPortal from './pages/TwelveGoPortal';
import UnifiedCheckout from './pages/UnifiedCheckout';
import VisaCheckout from './pages/VisaCheckout';
import WanderlinxPortal from './pages/WanderlinxPortal';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminAdCampaigns": AdminAdCampaigns,
    "AdminAds": AdminAds,
    "AdminAdvertisements": AdminAdvertisements,
    "AdminAffiliateAnalytics": AdminAffiliateAnalytics,
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
    "AdminDigitalStore": AdminDigitalStore,
    "AdminEmailClients": AdminEmailClients,
    "AdminFerries": AdminFerries,
    "AdminFlights": AdminFlights,
    "AdminHelpdesk": AdminHelpdesk,
    "AdminHotels": AdminHotels,
    "AdminInsurance": AdminInsurance,
    "AdminInsuranceProviders": AdminInsuranceProviders,
    "AdminInventoryMonitor": AdminInventoryMonitor,
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
    "BiyahekoPortal": BiyahekoPortal,
    "BusCheckout": BusCheckout,
    "CarRentalCheckout": CarRentalCheckout,
    "CorporateBooking": CorporateBooking,
    "CruiseCheckout": CruiseCheckout,
    "DatabaseSchema": DatabaseSchema,
    "DigitalStore": DigitalStore,
    "FerryCheckout": FerryCheckout,
    "FinitechArchitecture": FinitechArchitecture,
    "HotelCheckout": HotelCheckout,
    "LogoGenerator": LogoGenerator,
    "RegulatoryChecklist": RegulatoryChecklist,
    "SalesDashboard": SalesDashboard,
    "SupplierDashboard": SupplierDashboard,
    "SupplierLogin": SupplierLogin,
    "SupplierOnboarding": SupplierOnboarding,
    "TawkSupport": TawkSupport,
    "TourCheckout": TourCheckout,
    "TourDetail": TourDetail,
    "TrainBookingConfirmation": TrainBookingConfirmation,
    "TrainCheckout": TrainCheckout,
    "TripzynxPortal": TripzynxPortal,
    "TrustedAgency": TrustedAgency,
    "TwelveGoPortal": TwelveGoPortal,
    "UnifiedCheckout": UnifiedCheckout,
    "VisaCheckout": VisaCheckout,
    "WanderlinxPortal": WanderlinxPortal,
}

export const pagesConfig = {
    mainPage: "AdminAdCampaigns",
    Pages: PAGES,
    Layout: __Layout,
};