import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Gets prospects that belong to a certain archetype
 * @param userToken 
 * @param archetypeID
 * @param search - search string
 * @returns - MsgResponse
 */
export async function getArchetypeProspects(userToken: string, archetypeID: number, search: string = ""): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/archetype/${archetypeID}/prospects?search=${search}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      }
    }
  );
  return processResponse(response, 'prospects');

}
