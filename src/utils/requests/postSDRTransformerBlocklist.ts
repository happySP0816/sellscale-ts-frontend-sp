import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";


/**
 * Updates an SDR's default blocklist
 * @param userToken 
 * @param prospectId 
 * @returns - MsgResponse
 */
export async function updateSDRDefaultBlocklist(
  userToken: string,
  blocklist: string[],
): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/sdr/messaging/transformer_blocklist`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        blocklist: blocklist,
      })
    }
  );

  return await processResponse(response);
}