import { MsgResponse } from "src";
import getResponseJSON, { isMsgResponse } from "./utils";
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
  const result = await getResponseJSON("get-archetype-prospects", response);
  if(isMsgResponse(result)) { return result; }

  return { status: 'success', title: `Success`, message: `prospects-for-archetype-${archetypeID}-retrieved`, extra: result.prospects };

}
