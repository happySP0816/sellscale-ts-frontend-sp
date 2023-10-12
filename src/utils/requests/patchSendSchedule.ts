import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Patches a send schedule
 * @param userToken
 * @param timeZone
 * @param days
 * @param startTime
 * @param endTime
 * @returns - MsgResponse
 */
export async function patchSendSchedule(userToken: string, timeZone: string | null, days: number[] | null, startTime: string | null, endTime: string | null): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/sdr/email/schedule`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        time_zone: timeZone,
        days: days,
        start_time: startTime,
        end_time: endTime,
      })
    }
  );
  return await processResponse(response, 'data');

}