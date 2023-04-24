import { MsgResponse } from "src";
import getResponseJSON, { isMsgResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Generates a response given a Bump Framework ID
 * @param userToken 
 * @param prospectID
 * @param bumpFrameworkID
 * @returns - MsgResponse
 */
export async function postBumpGenerateResponse(userToken: string, prospectID: number, bumpFrameworkID: number): Promise<MsgResponse> {

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
      }),
    }
  );
  const result = await getResponseJSON("generate_li_bump_response", response);
  if (isMsgResponse(result)) { return result; }

  return { status: 'success', title: `Success`, message: `Generated LI Bump Response`, extra: result };

}
