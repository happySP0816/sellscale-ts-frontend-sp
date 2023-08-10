import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Generates a response to a LinkedIn conversation given a Bump Framework ID
 * @param userToken
 * @param prospectID
 * @param bumpFrameworkID
 * @returns - MsgResponse
 */
export async function postBumpGenerateResponse(
  userToken: string,
  prospectID: number,
  bumpFrameworkID: number | undefined,
  accountResearch: string | undefined,
  bumpLength: string | undefined,
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
  return await processResponse(response);
}


/**
 * Generates a response to an email thread given a Bump Framework ID
 * @param userToken
 * @param prospectID
 * @param emailThreadID // NOTE THAT THIS IS THE NYLAS THREAD ID
 * @param emailBumpFrameworkID
 * @param customAccountResearch
 * @returns - MsgResponse
 */
export async function postBumpGenerateEmailResponse(
  userToken: string,
  prospectID: number,
  emailThreadID: string,
  emailBumpFrameworkID?: number,
  customAccountResearch?: string[]
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/email_generation/generate/email_response`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prospect_id: prospectID,
        email_thread_id: emailThreadID,
        email_bump_framework_id: emailBumpFrameworkID,
        custom_account_research: customAccountResearch,
      }),
    }
  )
  return await processResponse(response, 'data');
}
