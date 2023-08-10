import { Channel, MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Adds existing contacts
 * @param userToken
 * @param contacts
 * @returns - MsgResponse
 */
export async function addExistingContacts(
  userToken: string,
  contacts: Record<string, any>[],
  connection_source: Channel
): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/prospect/existing_contacts`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: contacts,
        connection_source: connection_source,
      })
    }
  );
  return await processResponse(response, 'data');

}
