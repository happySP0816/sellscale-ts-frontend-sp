import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Gets bump frameworks
 * @param userToken 
 * @param clientArchetypeID
 * @returns - MsgResponse
 */
export async function postUnassignContacts(
  userToken: string,
  clientArchetypeID: number
): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/personas/prospects/unassign`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_archetype_id: clientArchetypeID,
        manual_unassign_list: [],
        use_icp_heuristic: true,
      }),
    }
  );
  return await processResponse(response, "data");

}
