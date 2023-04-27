import { MsgResponse } from "src";
import getResponseJSON, { isMsgResponse } from "./utils";
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
  const result = await getResponseJSON("patch_scheduling_link", response);
  if (isMsgResponse(result)) {
    return result;
  }

  return {
    status: "success",
    title: `Success`,
    message: `Successfully updated scheduling link.`
  };
}
