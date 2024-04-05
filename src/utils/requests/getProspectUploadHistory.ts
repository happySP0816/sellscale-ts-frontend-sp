import { API_URL } from "@constants/data";

/**
 * Fetch Prospect Upload History data from the server.
 * @param userToken - User's authentication token.
 * @param offset - The offset to start fetching data.
 * @param limit - The limit of data to fetch.
 * @returns - The fetched data.
 */
export async function getProspectUploadHistory(userToken: string, offset: number | undefined, limit: number | undefined) {
  const response = await fetch(
    `${API_URL}/prospect/upload/history?`  + (offset ? `offset=${offset}&` : '') + (limit ? `limit=${limit}` : ''),
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
