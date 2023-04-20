import { MsgResponse } from "src";
import getResponseJSON, { isMsgResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Connect Vessel Mailbox
 * @param userToken 
 * @returns - MsgResponse
 */
export async function connectVesselMailbox(userToken: string, vesselMailboxID: number): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/integration/vessel/mailboxes/select`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vessel_mailbox_id: vesselMailboxID
      })
    }
  );
  const result = await getResponseJSON("select-vessel-mailbox", response);
  if(isMsgResponse(result)) { return result; }

  return { status: 'success', title: `Success`, message: `Vessel Mailbox selected` };

}
