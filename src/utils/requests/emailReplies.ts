import { API_URL } from "@constants/data";
import { MsgResponse } from "src";
import { processResponse } from "./utils";

/**
 * Gets email reply frameworks
 * @param userToken
 * @param substatuses
 * @returns - MsgResponse
 */
export async function getEmailReplyFrameworks(userToken: string, substatuses: string[]): Promise<MsgResponse> {
  const substatuses_string = substatuses.join(',');

  const response = await fetch(
    `${API_URL}/email/replies/?active_only=true&substatuses=${substatuses_string}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      }
    }
  );
  return await processResponse(response);

}


/**
 * Patches email reply frameworks
 * @param userToken
 * @param replyFrameworkID
 * @param title
 * @param description
 * @param active
 * @param template
 * @param additional_instructions
 * @param use_account_research
 * @returns - MsgResponse
*/
export async function patchEmailReplyFrameworks(
  userToken: string,
  replyFrameworkID: number,
  title: string | null,
  description: string | null,
  active: boolean | null,
  template: string | null,
  additional_instructions: string | null,
  use_account_research: boolean | null,
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/email/replies/${replyFrameworkID}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": 'application/json',
      },
      body: JSON.stringify({
        title: title,
        description: description,
        active: active,
        template: template,
        additional_instructions: additional_instructions,
        use_account_research: use_account_research,
      })
    }
  );
  return await processResponse(response);
}


export async function postCreateEmailReplyFramework(
  userToken: string,
  overall_status: string,
  substatus: string,
  template: string,
  title: string,
  client_archetype_id: number,
  description: string | null,
  additional_instructions: string | null,
  use_account_research: boolean | null,
  research_blocklist: string[] | null,
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/email/replies/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": 'application/json',
      },
      body: JSON.stringify({
        overall_status: overall_status,
        substatus: substatus,
        template: template,
        title: title,
        client_archetype_id: client_archetype_id,
        description: description,
        additional_instructions: additional_instructions,
        use_account_research: use_account_research,
        research_blocklist: research_blocklist,
      })
    }
  );
  return await processResponse(response);
}


/**
 * Generates email reply
 * @param userToken
 * @param replyFrameworkID
 * @param prospectID
 * @returns - MsgResponse
 */
export async function postGenerateEmailReplyUsingFramework(userToken: string, replyFrameworkID: number, prospectID: number): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/email/replies/${replyFrameworkID}/generate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": 'application/json',
      },
      body: JSON.stringify({
        prospect_id: prospectID,
      })
    }
  );
  return await processResponse(response, "data");
}
