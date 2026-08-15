/**
 * pages.config.js - Page routing configuration
 *
 * Page components are code-split with React.lazy() to minimize the initial
 * bundle size on mobile devices. Each page is loaded on demand when its route
 * is visited. The Layout shell stays eager so the app frame renders instantly.
 */
import { lazy } from 'react';
import utils from './pages/utils';
import __Layout from './Layout.jsx';

const AIItineraryPlanner = lazy(() => import('./pages/AIItineraryPlanner'));
const AdminAdCampaigns = lazy(() => import('./pages/AdminAdCampaigns'));
const AdminAds = lazy(() => import('./pages/AdminAds'));
const AdminAdvertisements = lazy(() => import('./pages/AdminAdvertisements'));
const AdminAffiliateAnalytics = lazy(() => import('./pages/AdminAffiliateAnalytics'));
const AdminAffiliates = lazy(() => import('./pages/AdminAffiliates'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));
const AdminAuditLogs = lazy(() => import('./pages/AdminAuditLogs'));
const AdminBankAccounts = lazy(() => import('./pages/AdminBankAccounts'));
const AdminBuses = lazy(() => import('./pages/AdminBuses'));
const AdminCarRentals = lazy(() => import('./pages/AdminCarRentals'));
const AdminCodeBackup = lazy(() => import('./pages/AdminCodeBackup'));
const AdminCorporateClients = lazy(() => import('./pages/AdminCorporateClients'));
const AdminCtripIntegration = lazy(() => import('./pages/AdminCtripIntegration'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminDataManager = lazy(() => import('./pages/AdminDataManager'));
const AdminDigitalStore = lazy(() => import('./pages/AdminDigitalStore'));
const AdminEmailClients = lazy(() => import('./pages/AdminEmailClients'));
const AdminFerries = lazy(() => import('./pages/AdminFerries'));
const AdminFlights = lazy(() => import('./pages/AdminFlights'));
const AdminHelpdesk = lazy(() => import('./pages/AdminHelpdesk'));
const AdminHome = lazy(() => import('./pages/AdminHome'));
const AdminHotels = lazy(() => import('./pages/AdminHotels'));
const AdminInsurance = lazy(() => import('./pages/AdminInsurance'));
const AdminInsuranceProviders = lazy(() => import('./pages/AdminInsuranceProviders'));
const AdminInventoryMonitor = lazy(() => import('./pages/AdminInventoryMonitor'));
const AdminLoyalty = lazy(() => import('./pages/AdminLoyalty'));
const AdminMonetization = lazy(() => import('./pages/AdminMonetization'));
const AdminPackagePromoCodes = lazy(() => import('./pages/AdminPackagePromoCodes'));
const AdminPackageSales = lazy(() => import('./pages/AdminPackageSales'));
const AdminPackages = lazy(() => import('./pages/AdminPackages'));
const AdminPayouts = lazy(() => import('./pages/AdminPayouts'));
const AdminPricing = lazy(() => import('./pages/AdminPricing'));
const AdminPromotions = lazy(() => import('./pages/AdminPromotions'));
const AdminReviews = lazy(() => import('./pages/AdminReviews'));
const AdminSalesTeam = lazy(() => import('./pages/AdminSalesTeam'));
const AdminSecurityCenter = lazy(() => import('./pages/AdminSecurityCenter'));
const AdminSupplierBankAccounts = lazy(() => import('./pages/AdminSupplierBankAccounts'));
const AdminSupplierComms = lazy(() => import('./pages/AdminSupplierComms'));
const AdminSupplierPayments = lazy(() => import('./pages/AdminSupplierPayments'));
const AdminTours = lazy(() => import('./pages/AdminTours'));
const AdminVisas = lazy(() => import('./pages/AdminVisas'));
const AffiliateDashboard = lazy(() => import('./pages/AffiliateDashboard'));
const BestPriceGuarantee = lazy(() => import('./pages/BestPriceGuarantee'));
const BiyahekoPortal = lazy(() => import('./pages/BiyahekoPortal'));
const BookFlights = lazy(() => import('./pages/BookFlights'));
const BookingConfirmation = lazy(() => import('./pages/BookingConfirmation'));
const BusCheckout = lazy(() => import('./pages/BusCheckout'));
const BusSearch = lazy(() => import('./pages/BusSearch'));
const CarRentalCheckout = lazy(() => import('./pages/CarRentalCheckout'));
const CarRentalSearch = lazy(() => import('./pages/CarRentalSearch'));
const Contact = lazy(() => import('./pages/Contact'));
const CorporateBooking = lazy(() => import('./pages/CorporateBooking'));
const CruiseCheckout = lazy(() => import('./pages/CruiseCheckout'));
const CruiseSearch = lazy(() => import('./pages/CruiseSearch'));
const DatabaseSchema = lazy(() => import('./pages/DatabaseSchema'));
const DigitalStore = lazy(() => import('./pages/DigitalStore'));
const FerryCheckout = lazy(() => import('./pages/FerryCheckout'));
const FerrySearch = lazy(() => import('./pages/FerrySearch'));
const FinitechArchitecture = lazy(() => import('./pages/FinitechArchitecture'));
const FlightCheckout = lazy(() => import('./pages/FlightCheckout'));
const FlightDetail = lazy(() => import('./pages/FlightDetail'));
const FlightSearch = lazy(() => import('./pages/FlightSearch'));
const FlightTicket = lazy(() => import('./pages/FlightTicket'));
const Flights = lazy(() => import('./pages/Flights'));
const GDPRSettings = lazy(() => import('./pages/GDPRSettings'));
const Helpdesk = lazy(() => import('./pages/Helpdesk'));
const Home = lazy(() => import('./pages/Home'));
const HotelBookingConfirmation = lazy(() => import('./pages/HotelBookingConfirmation'));
const HotelCheckout = lazy(() => import('./pages/HotelCheckout'));
const HotelDetail = lazy(() => import('./pages/HotelDetail'));
const HotelSearch = lazy(() => import('./pages/HotelSearch'));
const Hotels = lazy(() => import('./pages/Hotels'));
const Itineraries = lazy(() => import('./pages/Itineraries'));
const ItineraryView = lazy(() => import('./pages/ItineraryView'));
const LogoGenerator = lazy(() => import('./pages/LogoGenerator'));
const ManageReservations = lazy(() => import('./pages/ManageReservations'));
const Messages = lazy(() => import('./pages/Messages'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const MyFlightBookings = lazy(() => import('./pages/MyFlightBookings'));
const MyPackages = lazy(() => import('./pages/MyPackages'));
const MyReviews = lazy(() => import('./pages/MyReviews'));
const PackageBookingSuccess = lazy(() => import('./pages/PackageBookingSuccess'));
const PackageBuilder = lazy(() => import('./pages/PackageBuilder'));
const Packages = lazy(() => import('./pages/Packages'));
const PaymentCancelled = lazy(() => import('./pages/PaymentCancelled'));
const PaymentMethods = lazy(() => import('./pages/PaymentMethods'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PremiumMembership = lazy(() => import('./pages/PremiumMembership'));
const PriceAlerts = lazy(() => import('./pages/PriceAlerts'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Profile = lazy(() => import('./pages/Profile'));
const RealTimeAvailability = lazy(() => import('./pages/RealTimeAvailability'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const RegulatoryChecklist = lazy(() => import('./pages/RegulatoryChecklist'));
const SafeAndSecure = lazy(() => import('./pages/SafeAndSecure'));
const SalesDashboard = lazy(() => import('./pages/SalesDashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const SharedItinerary = lazy(() => import('./pages/SharedItinerary'));
const SupplierDashboard = lazy(() => import('./pages/SupplierDashboard'));
const SupplierLogin = lazy(() => import('./pages/SupplierLogin'));
const SupplierOnboarding = lazy(() => import('./pages/SupplierOnboarding'));
const Support247 = lazy(() => import('./pages/Support247'));
const TawkSupport = lazy(() => import('./pages/TawkSupport'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const TourCheckout = lazy(() => import('./pages/TourCheckout'));
const TourDetail = lazy(() => import('./pages/TourDetail'));
const Tours = lazy(() => import('./pages/Tours'));
const TrainBookingConfirmation = lazy(() => import('./pages/TrainBookingConfirmation'));
const TrainCheckout = lazy(() => import('./pages/TrainCheckout'));
const TrainSearch = lazy(() => import('./pages/TrainSearch'));
const TransactionHistory = lazy(() => import('./pages/TransactionHistory'));
const TravelAlerts = lazy(() => import('./pages/TravelAlerts'));
const TravelAssistant = lazy(() => import('./pages/TravelAssistant'));
const TravelInsurance = lazy(() => import('./pages/TravelInsurance'));
const TripzynxPortal = lazy(() => import('./pages/TripzynxPortal'));
const TrustedAgency = lazy(() => import('./pages/TrustedAgency'));
const TwelveGoPortal = lazy(() => import('./pages/TwelveGoPortal'));
const UnifiedCheckout = lazy(() => import('./pages/UnifiedCheckout'));
const VisaCheckout = lazy(() => import('./pages/VisaCheckout'));
const Visas = lazy(() => import('./pages/Visas'));
const Wallet = lazy(() => import('./pages/Wallet'));
const WanderlinxPortal = lazy(() => import('./pages/WanderlinxPortal'));
const AdminIntegrations = lazy(() => import('./pages/AdminIntegrations'));

export const PAGES = {
    "AIItineraryPlanner": AIItineraryPlanner,
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
    "AdminHome": AdminHome,
    "AdminHotels": AdminHotels,
    "AdminInsurance": AdminInsurance,
    "AdminInsuranceProviders": AdminInsuranceProviders,
    "AdminInventoryMonitor": AdminInventoryMonitor,
    "AdminLoyalty": AdminLoyalty,
    "AdminMonetization": AdminMonetization,
    "AdminPackagePromoCodes": AdminPackagePromoCodes,
    "AdminPackageSales": AdminPackageSales,
    "AdminPackages": AdminPackages,
    "AdminPayouts": AdminPayouts,
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
    "BiyahekoPortal": BiyahekoPortal,
    "BookFlights": BookFlights,
    "BookingConfirmation": BookingConfirmation,
    "BusCheckout": BusCheckout,
    "BusSearch": BusSearch,
    "CarRentalCheckout": CarRentalCheckout,
    "CarRentalSearch": CarRentalSearch,
    "Contact": Contact,
    "CorporateBooking": CorporateBooking,
    "CruiseCheckout": CruiseCheckout,
    "CruiseSearch": CruiseSearch,
    "DatabaseSchema": DatabaseSchema,
    "DigitalStore": DigitalStore,
    "FerryCheckout": FerryCheckout,
    "FerrySearch": FerrySearch,
    "FinitechArchitecture": FinitechArchitecture,
    "FlightCheckout": FlightCheckout,
    "FlightDetail": FlightDetail,
    "FlightSearch": FlightSearch,
    "FlightTicket": FlightTicket,
    "Flights": Flights,
    "GDPRSettings": GDPRSettings,
    "Helpdesk": Helpdesk,
    "Home": Home,
    "HotelBookingConfirmation": HotelBookingConfirmation,
    "HotelCheckout": HotelCheckout,
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
    "RealTimeAvailability": RealTimeAvailability,
    "RefundPolicy": RefundPolicy,
    "RegulatoryChecklist": RegulatoryChecklist,
    "SafeAndSecure": SafeAndSecure,
    "SalesDashboard": SalesDashboard,
    "Settings": Settings,
    "SharedItinerary": SharedItinerary,
    "SupplierDashboard": SupplierDashboard,
    "SupplierLogin": SupplierLogin,
    "SupplierOnboarding": SupplierOnboarding,
    "Support247": Support247,
    "TawkSupport": TawkSupport,
    "TermsOfService": TermsOfService,
    "TourCheckout": TourCheckout,
    "TourDetail": TourDetail,
    "Tours": Tours,
    "TrainBookingConfirmation": TrainBookingConfirmation,
    "TrainCheckout": TrainCheckout,
    "TrainSearch": TrainSearch,
    "TransactionHistory": TransactionHistory,
    "TravelAlerts": TravelAlerts,
    "TravelAssistant": TravelAssistant,
    "TravelInsurance": TravelInsurance,
    "TripzynxPortal": TripzynxPortal,
    "TrustedAgency": TrustedAgency,
    "TwelveGoPortal": TwelveGoPortal,
    "UnifiedCheckout": UnifiedCheckout,
    "VisaCheckout": VisaCheckout,
    "Visas": Visas,
    "Wallet": Wallet,
    "WanderlinxPortal": WanderlinxPortal,
    "utils": utils,
    "AdminIntegrations": AdminIntegrations,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};