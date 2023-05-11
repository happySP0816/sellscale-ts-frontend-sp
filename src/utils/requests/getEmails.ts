import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";


export async function getEmailThreads(userToken: string, prospectId: number, limit: number, offset: number): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/prospect/${prospectId}/email/threads?limit=${limit}&offset=${offset}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return processResponse(response, 'data');
}


export async function getEmailMessages(userToken: string, prospectId: number, threadId: string): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/prospect/${prospectId}/email/messages?thread_id=${threadId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return processResponse(response, 'data');
}


/**
 * Get details for a specific email
 * @param userToken 
 * @param prospectId 
 * @param emailId 
 * @returns - MsgResponse
 */
async function getEmailDetails(userToken: string, prospectId: number, emailId: number): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/prospect/${prospectId}/email/${emailId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return processResponse(response, 'data');
}
