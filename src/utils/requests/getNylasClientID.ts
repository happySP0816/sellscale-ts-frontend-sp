import { MsgResponse } from "src";
import getResponseJson, { isMsgResponse } from "./utils";
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
  const result = await getResponseJson("nylas-client-id-get", response);
  if (isMsgResponse(result)) {
    return result;
  }

  return {
    status: "success",
    title: `Success`,
    message: `Gathered Nylas Client ID`,
    extra: result.nylas_client_id,
  };
}
