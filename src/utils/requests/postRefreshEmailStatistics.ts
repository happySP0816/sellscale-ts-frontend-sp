import { API_URL } from "@constants/data";
import { MsgResponse } from "src";
import { processResponse } from "./utils";

/**
 * Toggles the snapshot trigger
 * @param userToken
 * @returns - MsgResponse
 */
export default async function postRefreshEmailStatistics(userToken: string): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/sdr/email/statistics`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
    }
  );
  return await processResponse(response);
}
