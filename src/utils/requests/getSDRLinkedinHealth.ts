import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Get the SDR Linkedin Health
 * @param userToken 
 * @returns - MsgResponse
 */
export default async function getSDRLinkedinHealth(userToken: string): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/sdr/linkedin/health`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return await processResponse(response, 'data');

}