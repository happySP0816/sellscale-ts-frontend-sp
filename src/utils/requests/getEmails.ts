import { MsgResponse } from "src";
import getResponseJSON, { isMsgResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Get all email responses for a prospect
 * @param userToken
 * @param prospect_id
 * @returns - MsgResponse
 */
export default async function getEmails(userToken: string, prospectId: number): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/prospect/${prospectId}/all_emails`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  const result = await getResponseJSON("all-emails-get", response);
  if(isMsgResponse(result)) { return result; }

  const emails = await Promise.all(result.data.map(async (d: any) => {
    const statsResult = await getEmailDetails(userToken, prospectId, d.id);
    return {
      ...d,
      details: statsResult.status === 'success' ? statsResult.extra : null,
    };
  }));

  return { status: 'success', title: `Success`, message: `Gathered all emails`, extra: emails };

}


/**
 * Get details for a specific email
 * @param userToken 
 * @param prospectId 
 * @param emailId 
 * @returns - MsgResponse
 */
export async function getEmailDetails(userToken: string, prospectId: number, emailId: number): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/prospect/${prospectId}/email/${emailId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  const result = await getResponseJSON("email-details-get", response);
  if(isMsgResponse(result)) { return result; }

  return { status: 'success', title: `Success`, message: `Gathered email details`, extra: result.data };

}
