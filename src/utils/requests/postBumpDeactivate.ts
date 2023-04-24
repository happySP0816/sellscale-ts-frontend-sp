import { MsgResponse } from "src";
import getResponseJSON, { isMsgResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Deactivates a bump
 * @param userToken 
 * @param bumpFrameworkID
 * @returns - MsgResponse
 */
export async function postBumpDeactivate(userToken: string, bumpFrameworkID: number): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/bump_framework/bump/deactivate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bump_framework_id: bumpFrameworkID,
      })
    }
  );
  const result = await getResponseJSON("post_bump_deactivate", response);
  if (isMsgResponse(result)) { return result; }

  return { status: 'success', title: `Success`, message: `Bump framework deactivated.` };

}
