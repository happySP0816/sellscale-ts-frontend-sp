import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 *
 * @param userToken
 * @param convo_history
 * @param bump_frameworks
 * @returns -
 */
export async function autoSelectBumpFramework(
  userToken: string,
  convo_history: { connection_degree: string; message: string }[],
  bump_framework_ids: number[]
): Promise<MsgResponse> {
  if (convo_history.length === 0 || bump_framework_ids.length === 0) {
    return {
      status: "error",
      title: "Empty data",
      message: "Empty data",
    };
  }

  const response = await fetch(
    `${API_URL}/bump_framework/autoselect_framework`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        convo_history,
        bump_framework_ids,
      }),
    }
  );
  return await processResponse(response, "data");
}
