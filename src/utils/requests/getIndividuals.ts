import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

export default async function getIndividuals(userToken: string, archetypeId: number, limit: number, offset: number): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/individual/?archetype_id=${archetypeId}&limit=${limit}&offset=${offset}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  return await processResponse(response, 'data');
}

//convert https://www.linkedin.com/in/huntersgordon/ to just huntersgordon
const extractLiPublicIdFromURL = (url: string) => {
  return url?.split('/in/')[1]?.split('/')[0] ?? '';
}

/**
 * Fetches individual data from the server based on LinkedIn public ID or email.
 * 
 * @param {string} linkedinURL - The LinkedIn URL of the individual (optional).
 * @param {string} email - The email address of the individual (optional).
 * @returns {Promise<MsgResponse>} - The response containing the individual's data.
 */
export async function getIndividual(linkedinURL?: string, email?: string): Promise<MsgResponse> {
  let queryParams = new URLSearchParams();
  const li_public_id = linkedinURL ? extractLiPublicIdFromURL(linkedinURL) : undefined;
  if (li_public_id) queryParams.append('li_public_id', li_public_id);
  if (email) queryParams.append('email', email);

  const response = await fetch(`${API_URL}/individual/single?${queryParams.toString()}`);
  return await processResponse(response, 'data');
}
