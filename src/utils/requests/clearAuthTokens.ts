import { MsgResponse } from "src/main";
import getResponseJSON, { isMsgResponse } from "./utils";

/**
 * Clears the LinkedIn auth tokens for the SDR
 * @param userToken 
 * @returns - MsgResponse
 */
export async function clearAuthTokens(userToken: string): Promise<MsgResponse> {

  const response = await fetch(
    `${process.env.REACT_APP_API_URI}/voyager/auth_tokens`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  const result = await getResponseJSON("clear-linkedin-auth-tokens", response);
  if(isMsgResponse(result)) { return result; }

  return { status: 'success', title: `Success`, message: `Cleared tokens` };

}
