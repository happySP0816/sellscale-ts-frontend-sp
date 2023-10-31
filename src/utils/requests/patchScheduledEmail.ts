import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Patches a scheduled email
 * @param userToken
 * @param scheduleID
 * @param newDate
 * @returns - MsgResponse
 */
export async function patchScheduledEmails(userToken: string, scheduleID: number, newDate: Date | string): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/email/schedule/${scheduleID}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "new_time": newDate
      }),
    }
  );

  return await processResponse(response, 'data');

}