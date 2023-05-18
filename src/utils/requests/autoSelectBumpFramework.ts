import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * 
 * @param userToken 
 * @param convo_history 
 * @param bump_frameworks
 * @returns - 
 */
export async function autoSelectBumpFramework(
  userToken: string,
  convo_history: { connection_degree: string, message: string }[],
  bump_frameworks: string[],
): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/bump_framework/autoselect_framework`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        convo_history,
        bump_frameworks,
      })
    }
  );
  return await processResponse(response, 'data');

}
