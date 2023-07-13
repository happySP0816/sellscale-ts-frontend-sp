import { API_URL } from "@constants/data";
import { showNotification } from "@mantine/notifications";
import { MsgResponse } from "src";
import { processResponse } from "./utils";

/**
 * Toggles the auto bump feature for an SDR
 * @param userToken
 * @returns - MsgResponse
 */
export default async function postToggleAutoBump(userToken: string): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/client/sdr/auto_bump`,
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
