// ===================================================
// LOCAL DEV MOCK ENTITIES (Base44 COMPLETELY REMOVED)
// ===================================================

// Generic mock entity factory
const mockEntity = {
  list: async () => [],
  get: async () => null,
  create: async () => ({ success: true }),
  update: async () => ({ success: true }),
  delete: async () => ({ success: true }),
};

// Export mocks with SAME NAMES (so other files don't break)
export const ContentTemplate = mockEntity;
export const ServiceBooking = mockEntity;
export const PrayerRequest = mockEntity;
export const Program = mockEntity;
export const SupportTicket = mockEntity;
export const Donation = mockEntity;
export const NewsletterSubscriber = mockEntity;
export const Feedback = mockEntity;
export const AuditLog = mockEntity;
export const NewsletterCampaign = mockEntity;
export const WebsiteContent = mockEntity;
export const Gallery = mockEntity;
export const ChatLog = mockEntity;
export const ChatFlow = mockEntity;
export const UserActivityLog = mockEntity;
export const DonorAddress = mockEntity;
export const OTPVerification = mockEntity;
export const DonorProfile = mockEntity;
export const MSG91Config = mockEntity;
export const RazorpayConfig = mockEntity;
export const MailConfig = mockEntity;
export const ProgramReminder = mockEntity;
export const NewsletterLog = mockEntity;
export const UserNotification = mockEntity;
export const UserRole = mockEntity;
export const UserLoginLog = mockEntity;
export const PayPalConfig = mockEntity;
export const Book = mockEntity;
export const BookOrder = mockEntity;
export const BookOrderItem = mockEntity;
export const TaxConfig = mockEntity;
export const HomepageService = mockEntity;
export const ShowCategory = mockEntity;
export const CategoryShow = mockEntity;
export const HomepageHero = mockEntity;
export const EmailLog = mockEntity;
export const CertificateAssets = mockEntity;
export const GalleryCategory = mockEntity;
export const ResendConfig = mockEntity;
export const Testimonial = mockEntity;
export const VideoTestimonial = mockEntity;
export const ProgramImage = mockEntity;
export const FailedPayment = mockEntity;
export const PaymentLog = mockEntity;
export const BlockedServiceDate = mockEntity;
export const Invoice = mockEntity;
export const FestiveTheme = mockEntity;
export const AppUser = mockEntity;
export const LegacyOverallBilling = mockEntity;
export const LegacyServiceBooking = mockEntity;

// auth mock
export const User = {
  current: async () => ({
    id: 1,
    name: "Local Dev User",
    role: "admin",
  }),
};
