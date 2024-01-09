import { API_URL } from "@constants/data";

/**
 * Fetch Rejection Report data from the server.
 * @param userToken - User's authentication token.
 * @param clientSdrId - Client SDR ID.
 * @returns - The fetched data.
 */
export async function getRejectionReportData(userToken: string,) {
  const response = await fetch(
    `${API_URL}/analytics/rejection_report`,
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
