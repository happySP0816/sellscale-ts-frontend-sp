import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Get upcoming LinkedIn generations
 * @param userToken 
 * @param activeOnly
 * @param clientWide
 * @returns - MsgResponse
 */
export async function getUpcomingGenerations(userToken: string, activeOnly: boolean, clientWide: boolean): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/archetype/generations?active_only=${activeOnly}&client_wide=${clientWide}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      }
    }
  );
  return await processResponse(response, 'data');

}
