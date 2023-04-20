import { MsgResponse } from "src";
import getResponseJSON, { isMsgResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Disconnect Vessel Mailbox
 * @param userToken 
 * @returns - MsgResponse
 */
export async function disconnectVesselMailbox(userToken: string): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/integration/vessel/mailboxes/remove`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  const result = await getResponseJSON("remove-vessel-mailbox", response);
  if(isMsgResponse(result)) { return result; }

  return { status: 'success', title: `Success`, message: `Removed outbounding email selection, please select another in order to use Email outbound.` };

}
