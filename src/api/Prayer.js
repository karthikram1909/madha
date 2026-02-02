import apiClient from "./apiClient";

/**
 * Create Prayer Request
 * POST /prayer/my
 */
export const createPrayerRequestApi = async (payload) => {
  const response = await apiClient.post("prayer/create.php", payload);
  return response.data;
};
