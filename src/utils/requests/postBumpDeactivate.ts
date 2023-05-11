import { MsgResponse } from "src";
import { processResponse } from "./utils";
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
  return processResponse(response);

}
