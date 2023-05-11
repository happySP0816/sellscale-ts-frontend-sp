import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Clears the Nylas tokens for the SDR
 * @param userToken
 * @returns - MsgResponse
 */
export async function clearNylasTokens(userToken: string): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/nylas/auth_tokens`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return processResponse(response);

}
