import { API_URL } from "@constants/data";

/**
 * Fetch Rejection Analysis data from the server.
 * @param userToken - User's authentication token.
 * @param clientSdrId - Client SDR ID.
 * @param status - The status to filter data ('NOT_INTERESTED' or 'NOT_QUALIFIED').
 * @returns - The fetched data.
 */
export async function getRejectionAnalysisData(userToken: string, status: string) {
  const response = await fetch(
    `${API_URL}/analytics/rejection_analysis?status=${status}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return await response.json();
}
