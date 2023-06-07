import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Gets a Archetype's prospect filter
 * @param userToken 
 * @param archetypeID
 * @returns - MsgResponse
 */
export async function getProspectFilters(
  userToken: string,
  archetypeID: number,
): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/archetype/${archetypeID}/prospect_filter`,
    {
      method: "GET",
      headers: {Authorization: `Bearer ${userToken}`,},
    }
  );

  return await processResponse(response, 'data');
  
}
