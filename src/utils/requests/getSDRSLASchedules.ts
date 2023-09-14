import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Get's the SLA Schedule for an SDR
 * @param userToken 
 * @param startDate
 * @param endDate
 * @returns - MsgResponse
 */
export default async function getSDRSLASchedules(userToken: string, startDate?: string, endDate?: string): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/sdr/sla/schedule` + (startDate ? `?start_date=${startDate}` : ``) + (endDate ? `&end_date=${endDate}` : ``),
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return await processResponse(response, 'data');

}