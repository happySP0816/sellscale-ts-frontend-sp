import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Gets the best account research points from the bump framework and convo history
 * @param userToken 
 * @param prospect_id 
 * @param convo_history 
 * @param bump_framework_desc 
 * @param account_research 
 * @returns - Array of indexes for account research points
 */
export async function autoFillAccountResearch(
  userToken: string,
  prospect_id: number,
  convo_history: { connection_degree: string, message: string }[],
  bump_framework_desc: string,
  account_research: string[],
): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/bump_framework/autofill_research`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prospect_id,
        convo_history,
        bump_framework_desc,
        account_research,
      })
    }
  );
  return await processResponse(response, 'data');

}
