// import { createClient } from '@base44/sdk';
// // import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// // Create a client with authentication required
// export const base44 = createClient({
//   appId: "68f9beb680650e7849f02a09", 
//   requiresAuth: true // Ensure authentication is required for all operations
// });
// TEMP dummy client (local dev)
import { getLoggedInUser, logoutUser } from './auth';

// TEMP dummy client (local dev/prod without SDK)
export const base44 = {
  from: () => ({
    select: async () => ({ data: [], error: null })
  }),
  auth: {
    isAuthenticated: async () => !!localStorage.getItem("isLoggedIn"),
    me: async () => getLoggedInUser(),
    logout: async () => {
      logoutUser();
      return { success: true };
    },
    redirectToLogin: (redirectUrl) => {
      window.location.href = `/Login?redirect=${encodeURIComponent(redirectUrl || '')}`;
    },
    signUp: async () => ({ error: { message: "Signup disabled in this mode" } }),
    signIn: async () => ({ error: { message: "Use standard login" } })
  },
  functions: {
    invoke: async (funcName) => {
      console.log(`Mocking function invoke: ${funcName}`);
      return { data: { success: true } };
    }
  }
};
