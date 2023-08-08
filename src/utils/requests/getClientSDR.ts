import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Gets SDR
 * @param userToken 
 * @returns - MsgResponse
 */
export async function getSDR(
  userToken: string,
): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/sdr`,
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
 * Gets SDR general info
 * @param userToken 
 * @returns - MsgResponse
 */
export async function getSDRGeneralInfo(
  userToken: string,
): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/sdr/general_info`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      }
    }
  );
  return await processResponse(response, 'data');

}
