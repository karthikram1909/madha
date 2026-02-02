// import { createClient } from '@base44/sdk';
// // import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// // Create a client with authentication required
// export const base44 = createClient({
//   appId: "68f9beb680650e7849f02a09", 
//   requiresAuth: true // Ensure authentication is required for all operations
// });
// TEMP dummy client (local dev)
export const base44 = {
  from: () => ({
    select: async () => ({ data: [], error: null })
  })
};
