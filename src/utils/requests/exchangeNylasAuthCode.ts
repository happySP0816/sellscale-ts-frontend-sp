import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Get Nylas Client ID for SellScale
 *
 * @returns - MSGResponse
 */
export default async function exchangeNylasClientID(
  userToken: string,
  nylasCode: string
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/client/nylas/exchange_for_authorization_code`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nylas_code: nylasCode,
      }),
    }
  );
  return await processResponse(response);
}
