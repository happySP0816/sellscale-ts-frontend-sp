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
