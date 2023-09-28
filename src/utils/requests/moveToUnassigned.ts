import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Move selected prospects to unassigned
 * @param userToken 
 * @param archetypeID
 * @param prospectIDs
 * @returns - MsgResponse
 */
export async function moveToUnassigned(
  userToken: string, 
  archetypeID: number,
  prospectIDs: number[],
): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/icp_scoring/move_selected_prospects_to_unassigned`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_archetype_id: archetypeID,
        prospect_ids: prospectIDs,
      })
    }
  );
  return await processResponse(response);

}

