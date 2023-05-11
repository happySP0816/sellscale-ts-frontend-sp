import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Updates the scheduling link for an SDR
 * @param userToken
 * @param schedulingLink
 * @returns - MsgResponse
 */
export async function patchSchedulingLink(
  userToken: string,
  schedulingLink: string
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/client/sdr/update_scheduling_link`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "scheduling_link": schedulingLink
      }),
    }
  );
  return await processResponse(response);
}
