import { API_URL } from "@constants/data";
import { showNotification } from "@mantine/notifications";
import { MsgResponse } from "src";
import { processResponse } from "./utils";

/**
 * Patch SDR Blacklist
 * @param userToken
 * @param blacklist
 * @returns - MsgResponse
 */
export default async function patchSDRBlacklist(userToken: string, blacklist: string[]): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/client/sdr/blacklist_words`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        blacklist_words: blacklist,
      }),
    }
  );
  return await processResponse(response);
}
