import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Generates a response given a Bump Framework ID
 * @param userToken
 * @param prospectID
 * @param bumpFrameworkID
 * @returns - MsgResponse
 */
export async function postBumpGenerateResponse(
  userToken: string,
  prospectID: number,
  bumpFrameworkID: number,
  accountResearch: string | null,
  bumpLength: string | null,
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/li_conversation/prospect/generate_response`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prospect_id: prospectID,
        bump_framework_id: bumpFrameworkID,
        account_research_copy: accountResearch,
        bump_length: bumpLength,
      }),
    }
  );
  return processResponse(response);
}
