import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Get Nylas Client ID for SellScale
 * @param userToken
 * @returns - MSGResponse
 */
export default async function getNylasClientID(
  userToken: string
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/client/nylas/get_nylas_client_id`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return processResponse(response, 'nylas_client_id');
}
