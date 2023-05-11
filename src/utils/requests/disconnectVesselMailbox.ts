import { MsgResponse } from "src";
import { processResponse } from "./utils";
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
  return await processResponse(response);

}
