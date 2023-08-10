import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Adds existing contacts to persona
 * @param userToken
 * @param contacts
 * @returns - MsgResponse
 */
export async function addExistingContactsToPersona(
  userToken: string,
  persona_id: number,
  contact_ids: number[],
): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/prospect/existing_contacts/add_to_persona`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        persona_id: persona_id,
        contact_ids: contact_ids,
      })
    }
  );
  return await processResponse(response, 'data');

}
