import { MsgResponse } from "src/main";
import getResponseJSON, { isMsgResponse } from "./utils";

/**
 * Get all email responses for a prospect
 * @param userToken
 * @param prospect_id
 * @returns - MsgResponse
 */
export default async function getEmails(userToken: string, prospect_id: number): Promise<MsgResponse> {

  const response = await fetch(
    `${process.env.REACT_APP_API_URI}/prospect/${prospect_id}/all_emails`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  const result = await getResponseJSON("all-emails-get", response);
  if(isMsgResponse(result)) { return result; }

  return { status: 'success', title: `Success`, message: `Gathered all emails`, extra: result.data };

}