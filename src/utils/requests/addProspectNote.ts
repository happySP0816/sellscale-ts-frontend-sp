import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Add a note to a prospect
 * @param userToken 
 * @param prospectId 
 * @param note 
 * @returns - MsgResponse
 */
export async function addProspectNote(userToken: string, prospectId: number, note: string): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/prospect/add_note`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "prospect_id": prospectId,
        "note": note,
      }),
    }
  );
  return await processResponse(response);

}
