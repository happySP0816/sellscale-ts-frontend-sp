import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Get Smartlead prospects that have rpelied
 * @param userToken
 * @returns - MsgResponse
 */
export async function getSmartleadRepliedProspects(
  userToken: string,
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/smartlead/prospect/replied`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return await processResponse(response, "data");
}
