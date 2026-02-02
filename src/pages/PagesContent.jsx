import Layout from "./Layout.jsx";

import Page404 from "./404";

import About from "./About";

import AdminBooks from "./AdminBooks";

import AdminInvoiceList from "./AdminInvoiceList";

import AnalyticsDashboard from "./AnalyticsDashboard";

import ApiGenerator from "./ApiGenerator";

import AuditLog from "./AuditLog";

import BatchUserLinker from "./BatchUserLinker";

import BlockedServiceDates from "./BlockedServiceDates";

import BookOrders from "./BookOrders";

import BookService from "./BookService";

import BookingCalendar from "./BookingCalendar";

import BuyBooks from "./BuyBooks";

import ChatbotManager from "./ChatbotManager";

import Contact from "./Contact";

import ContentTemplates from "./ContentTemplates";

import Dashboard from "./Dashboard";

import Donate from "./Donate";

import DonationAdmin from "./DonationAdmin";

import Donations from "./Donations";

import EmailLogs from "./EmailLogs";

import Feedback from "./Feedback";

import FeedbackForm from "./FeedbackForm";

import FestiveThemeManager from "./FestiveThemeManager";

import FireTV from "./FireTV";

import FixTRNNumbers from "./FixTRNNumbers";

import FloatingUIManager from "./FloatingUIManager";

import FooterManager from "./FooterManager";

import Gallery from "./Gallery";

import GalleryManager from "./GalleryManager";

import Home from "./Home";

import HomepageHeroManager from "./HomepageHeroManager";

import HomepageServicesManager from "./HomepageServicesManager";

import Invoice from "./Invoice";

import LiveTV from "./LiveTV";

import MissedPayments from "./MissedPayments";

import MySQLUserMigration from "./MySQLUserMigration";

import Newsletter from "./Newsletter";

import NewsletterSignup from "./NewsletterSignup";

import OAuthCallback from "./OAuthCallback";

import PaymentLogs from "./PaymentLogs";

import PlaystoreTV from "./PlaystoreTV";

import PrayerRequest from "./PrayerRequest";

import PrayerRequestsAdmin from "./PrayerRequestsAdmin";

import PrivacyPolicy from "./PrivacyPolicy";

import ProgramImageUpload from "./ProgramImageUpload";

import ProgramSchedule from "./ProgramSchedule";

import Reach from "./Reach";

import RecoveryHistory from "./RecoveryHistory";

import Reports from "./Reports";

import SQLFileMigration from "./SQLFileMigration";

import Schedule from "./Schedule";

import ServiceBookings from "./ServiceBookings";

import Settings from "./Settings";

import ShowCategoriesManager from "./ShowCategoriesManager";

import Shows from "./Shows";

import SupportTickets from "./SupportTickets";

import TermsAndConditions from "./TermsAndConditions";

import TestimonialPromoVideo from "./TestimonialPromoVideo";

import TestimonialsManager from "./TestimonialsManager";

import UserActivityLog from "./UserActivityLog";

import UserBookServices from "./UserBookServices";

import UserBookingCalendar from "./UserBookingCalendar";

import UserBookingHistory from "./UserBookingHistory";

import UserBuyBooks from "./UserBuyBooks";

import UserDashboard from "./UserDashboard";

import UserDataVerification from "./UserDataVerification";

import UserDonationPage from "./UserDonationPage";

import UserDonations from "./UserDonations";

import UserInvoices from "./UserInvoices";

import UserManagement from "./UserManagement";

import UserMigrationPanel from "./UserMigrationPanel";

import UserPrayerRequests from "./UserPrayerRequests";

import UserProfileSettings from "./UserProfileSettings";

import UserProgramSchedule from "./UserProgramSchedule";

import UserSupportTickets from "./UserSupportTickets";

import VideoTestimonialsManager from "./VideoTestimonialsManager";

import WebsiteContentManager from "./WebsiteContentManager";

import ProfilePasswordChange from "./ProfilePasswordChange.jsx"

import StickyNavbar from "../components/website/StickyNavbar";

import ProtectedRoute from "./ProtectedRoute.jsx";

import BuyBooksformobile from "./BuyBooksformobile.jsx";

import Aboutformobileview from "./Aboutformobileview.jsx"

import { Route, Routes, useLocation } from 'react-router-dom';

// import Login from "./Login.jsx";
import Register from "./Register.jsx";

const PAGES = {

    404: 404,

    About: About,

    AdminBooks: AdminBooks,

    AdminInvoiceList: AdminInvoiceList,

    AnalyticsDashboard: AnalyticsDashboard,

    ApiGenerator: ApiGenerator,

    AuditLog: AuditLog,

    BatchUserLinker: BatchUserLinker,

    BlockedServiceDates: BlockedServiceDates,

    BookOrders: BookOrders,

    BookService: BookService,

    BookingCalendar: BookingCalendar,

    BuyBooks: BuyBooks,

    ChatbotManager: ChatbotManager,

    Contact: Contact,

    ContentTemplates: ContentTemplates,

    Dashboard: Dashboard,

    Donate: Donate,

    DonationAdmin: DonationAdmin,

    Donations: Donations,

    EmailLogs: EmailLogs,

    Feedback: Feedback,

    FeedbackForm: FeedbackForm,

    FestiveThemeManager: FestiveThemeManager,

    FireTV: FireTV,

    FixTRNNumbers: FixTRNNumbers,

    FloatingUIManager: FloatingUIManager,

    FooterManager: FooterManager,

    Gallery: Gallery,

    GalleryManager: GalleryManager,

    Home: Home,

    HomepageHeroManager: HomepageHeroManager,

    HomepageServicesManager: HomepageServicesManager,

    Invoice: Invoice,

    LiveTV: LiveTV,

    MissedPayments: MissedPayments,

    MySQLUserMigration: MySQLUserMigration,

    Newsletter: Newsletter,

    NewsletterSignup: NewsletterSignup,

    OAuthCallback: OAuthCallback,

    PaymentLogs: PaymentLogs,

    PlaystoreTV: PlaystoreTV,

    PrayerRequest: PrayerRequest,

    PrayerRequestsAdmin: PrayerRequestsAdmin,

    PrivacyPolicy: PrivacyPolicy,

    ProgramImageUpload: ProgramImageUpload,

    ProgramSchedule: ProgramSchedule,

    Reach: Reach,

    RecoveryHistory: RecoveryHistory,

    Reports: Reports,

    SQLFileMigration: SQLFileMigration,

    Schedule: Schedule,

    ServiceBookings: ServiceBookings,

    Settings: Settings,

    ShowCategoriesManager: ShowCategoriesManager,

    Shows: Shows,

    SupportTickets: SupportTickets,

    TermsAndConditions: TermsAndConditions,

    TestimonialPromoVideo: TestimonialPromoVideo,

    TestimonialsManager: TestimonialsManager,

    UserActivityLog: UserActivityLog,

    UserBookServices: UserBookServices,

    UserBookingCalendar: UserBookingCalendar,

    UserBookingHistory: UserBookingHistory,

    UserBuyBooks: UserBuyBooks,

    UserDashboard: UserDashboard,

    UserDataVerification: UserDataVerification,

    UserDonationPage: UserDonationPage,

    UserDonations: UserDonations,

    UserInvoices: UserInvoices,

    UserManagement: UserManagement,

    UserMigrationPanel: UserMigrationPanel,

    UserPrayerRequests: UserPrayerRequests,

    UserProfileSettings: UserProfileSettings,

    UserProgramSchedule: UserProgramSchedule,

    UserSupportTickets: UserSupportTickets,

    VideoTestimonialsManager: VideoTestimonialsManager,

    WebsiteContentManager: WebsiteContentManager,

    ProfilePasswordChange: ProfilePasswordChange,

    StickyNavbar: StickyNavbar,

    BuyBooksformobile: BuyBooksformobile,

    Aboutformobileview:Aboutformobileview,
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}





// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPath = location.pathname;
    const hideSidebar = currentPath === "/" || currentPath === "/Home";


    return (
        <Layout currentPageName={currentPath.replace("/", "") || "Home"}>
            <Routes>



                {/*                    
                    <Route path="/" element={<Page404  />} /> */}
                <Route index element={<Home />} />


                <Route path="/404" element={< Page404 />} />

                <Route path="About" element={<About />} />

                <Route path="AdminBooks" element={<AdminBooks />} />

                <Route path="AdminInvoiceList" element={<AdminInvoiceList />} />

                <Route path="AnalyticsDashboard" element={<AnalyticsDashboard />} />

                <Route path="ApiGenerator" element={<ApiGenerator />} />

                <Route path="AuditLog" element={<AuditLog />} />

                <Route path="BatchUserLinker" element={<BatchUserLinker />} />

                <Route path="BlockedServiceDates" element={<BlockedServiceDates />} />

                <Route path="BookOrders" element={<BookOrders />} />

                <Route path="BookService" element={<BookService />} />

                <Route path="BookingCalendar" element={<BookingCalendar />} />

                <Route path="BuyBooks" element={<BuyBooks />} />

                <Route path="ChatbotManager" element={<ChatbotManager />} />

                <Route path="Contact" element={<Contact />} />

                <Route path="ContentTemplates" element={<ContentTemplates />} />

                <Route path="Dashboard" element={<ProtectedRoute>   <Dashboard /></ProtectedRoute>} />

                <Route path="Donate" element={<Donate />} />

                <Route path="DonationAdmin" element={<DonationAdmin />} />

                <Route path="Donations" element={<Donations />} />

                <Route path="EmailLogs" element={<EmailLogs />} />

                <Route path="Feedback" element={<Feedback />} />

                <Route path="FeedbackForm" element={<FeedbackForm />} />

                <Route path="FestiveThemeManager" element={<FestiveThemeManager />} />

                <Route path="FireTV" element={<FireTV />} />

                <Route path="FixTRNNumbers" element={<FixTRNNumbers />} />

                <Route path="FloatingUIManager" element={<FloatingUIManager />} />

                <Route path="FooterManager" element={<FooterManager />} />

                <Route path="Gallery" element={<Gallery />} />

                <Route path="GalleryManager" element={<GalleryManager />} />

                <Route path="Home" element={<Home />} />

                <Route path="HomepageHeroManager" element={<HomepageHeroManager />} />

                <Route path="HomepageServicesManager" element={<HomepageServicesManager />} />

                <Route path="Invoice" element={<Invoice />} />

                <Route path="LiveTV" element={<LiveTV />} />

                <Route path="MissedPayments" element={<MissedPayments />} />

                <Route path="MySQLUserMigration" element={<MySQLUserMigration />} />

                <Route path="Newsletter" element={<Newsletter />} />

                <Route path="NewsletterSignup" element={<NewsletterSignup />} />

                <Route path="OAuthCallback" element={<OAuthCallback />} />

                <Route path="PaymentLogs" element={<PaymentLogs />} />

                <Route path="PlaystoreTV" element={<PlaystoreTV />} />

                <Route path="PrayerRequest" element={<PrayerRequest />} />

                <Route path="PrayerRequestsAdmin" element={<PrayerRequestsAdmin />} />

                <Route path="PrivacyPolicy" element={<PrivacyPolicy />} />

                <Route path="ProgramImageUpload" element={<ProgramImageUpload />} />

                <Route path="ProgramSchedule" element={<ProgramSchedule />} />

                <Route path="Reach" element={<Reach />} />

                <Route path="RecoveryHistory" element={<RecoveryHistory />} />

                <Route path="Reports" element={<Reports />} />

                <Route path="SQLFileMigration" element={<SQLFileMigration />} />

                <Route path="Schedule" element={<Schedule />} />

                <Route path="ServiceBookings" element={<ServiceBookings />} />

                <Route path="Settings" element={<Settings />} />

                <Route path="ShowCategoriesManager" element={<ShowCategoriesManager />} />

                <Route path="Shows" element={<Shows />} />

                <Route path="SupportTickets" element={<SupportTickets />} />

                <Route path="TermsAndConditions" element={<TermsAndConditions />} />

                <Route path="TestimonialPromoVideo" element={<TestimonialPromoVideo />} />

                <Route path="TestimonialsManager" element={<TestimonialsManager />} />

                <Route path="UserActivityLog" element={<UserActivityLog />} />

                <Route path="UserBookServices" element={<UserBookServices />} />

                <Route path="UserBookingCalendar" element={<UserBookingCalendar />} />

                <Route path="UserBookingHistory" element={<UserBookingHistory />} />

                <Route path="UserBuyBooks" element={<ProtectedRoute><UserBuyBooks /></ProtectedRoute>} />

                <Route path="UserDashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />

                <Route path="UserDataVerification" element={<UserDataVerification />} />

                <Route path="UserDonationPage" element={<UserDonationPage />} />

                <Route path="UserDonations" element={<UserDonations />} />

                <Route path="UserInvoices" element={<UserInvoices />} />

                <Route path="UserManagement" element={<UserManagement />} />

                <Route path="UserMigrationPanel" element={<UserMigrationPanel />} />

                <Route path="UserPrayerRequests" element={<UserPrayerRequests />} />

                <Route path="UserProfileSettings" element={<UserProfileSettings />} />

                <Route path="UserProgramSchedule" element={<UserProgramSchedule />} />

                <Route path="UserSupportTickets" element={<UserSupportTickets />} />

                <Route path="VideoTestimonialsManager" element={<VideoTestimonialsManager />} />

                <Route path="WebsiteContentManager" element={<WebsiteContentManager />} />

                <Route path="ProfilePasswordChange" element={<ProfilePasswordChange />} />

                <Route
                    path="/BuyBooksformobile"
                    element={
                        <Layout currentPageName="BuyBooksformobile">
                            <BuyBooksformobile />
                        </Layout>
                    }
                />
                  <Route
                    path="/Aboutformobileview"
                    element={<Aboutformobileview />}
                />




                {/* <Route path="/Home" element={<home />} /> */}


                {/* <Route path="StickyNavbar" element={<StickyNavbar />} /> */}


            </Routes>
        </Layout>
    );
}
export default PagesContent;