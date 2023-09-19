import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Gets conversion data for a certain archetype
 * @param userToken 
 * @param archetypeID
 * @returns - MsgResponse
 */
export async function getArchetypeConversion(userToken: string, archetypeID: number): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/archetype/get_archetype?archetype_id=${archetypeID}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      }
    }
  );
  return await processResponse(response, 'archetype');

}
