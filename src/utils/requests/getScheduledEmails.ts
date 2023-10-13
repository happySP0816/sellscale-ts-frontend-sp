import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Gets scheduled emails for a user
 * @param userToken
 * @param prospectID
 * @param futureOnly
 * @returns - MsgResponse
 */
export async function getScheduledEmails(userToken: string, prospectID: number | null, futureOnly: boolean | null): Promise<MsgResponse> {

  let response;
  if (prospectID) {
    response = await fetch(
      `${API_URL}/email/schedule/?prospect_id=${prospectID}&future_only=${futureOnly}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
  } else {
    response = await fetch(
      `${API_URL}/email/schedule/?future_only=${futureOnly}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
  }

  
  return await processResponse(response, 'data');

}