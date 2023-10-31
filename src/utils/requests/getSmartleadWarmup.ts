import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Get warmup statuses from smartlead
 * @param userToken
 * @returns - MsgResponse
 */
export async function getSmartleadWarmup(userToken: string): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/email/warmup/smartlead`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  return await processResponse(response);
}