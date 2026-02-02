// ===================================================
// LOCAL DEV MOCK FUNCTIONS (Base44 REMOVED)
// ===================================================
// These are TEMP mocks so frontend can run.
// Later these will be replaced with Laravel APIs.

// Email / Notification
export const sendDonationEmail = async () => ({ success: true });
export const sendDonationReceipt = async () => ({ success: true });
export const sendBookingConfirmation = async () => ({ success: true });
export const sendTransactionalEmail = async () => ({ success: true });
export const sendNewsletter = async () => ({ success: true });
export const sendBookOrderEmail = async () => ({ success: true });
export const sendResendEmail = async () => ({ success: true });

// OTP
export const sendOTP = async () => ({ success: true, otp: "123456" });
export const verifyOTP = async () => ({ success: true });

// Invoice / Documents
export const generateDonationDocument = async () => ({ success: true });
export const generateDonationReceipt = async () => ({ success: true });
export const generateBookingInvoice = async () => ({ success: true });
export const generateBookInvoice = async () => ({ success: true });
export const invoiceGenerator = async () => ({ success: true });

// Payments
export const createRazorpayOrder = async () => ({ success: true, orderId: "LOCAL_ORDER" });
export const createRazorpaySubscription = async () => ({ success: true });
export const handlePayPalPayment = async () => ({ success: true });

// Export / Reports
export const exportDonations = async () => ({ success: true });
export const exportServiceBookings = async () => ({ success: true });

// Utilities
export const parseCsvFile = async () => ({ success: true, data: [] });
export const generateTRN = async () => ({ success: true, trn: "TRN001" });
export const generateBookTRN = async () => ({ success: true });

// Admin / Migration
export const inviteUser = async () => ({ success: true });
export const createEntityFromSchema = async () => ({ success: true });
export const migrateUsersFromSQL = async () => ({ success: true });
export const migrateLegacyUsersToAppUser = async () => ({ success: true });
export const linkLegacyUser = async () => ({ success: true });
export const batchLinkAllUsers = async () => ({ success: true });
export const getUserVerificationData = async () => ({ success: true });
export const migrateUsersFromAPI = async () => ({ success: true });
export const migrateUsersFromMySQL = async () => ({ success: true });

// Testing
export const testSmtpConnection = async () => ({ success: true });
export const testResendConnection = async () => ({ success: true });
export const testMySQLConnection = async () => ({ success: true });

// Mobile
export const mobileAPI = async () => ({ success: true });
