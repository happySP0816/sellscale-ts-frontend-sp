import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Clears the LinkedIn auth tokens for the SDR
 * @param userToken 
 * @returns - MsgResponse
 */
export async function clearAuthTokens(userToken: string): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/voyager/auth_tokens`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return processResponse(response);

}
