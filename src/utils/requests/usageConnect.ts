import { API_URL } from "@constants/data";
import { MsgResponse } from "src";
import { processResponse } from "./utils";

export async function getUsageConnectResponse(
  userToken: string
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/usage/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
  });
  return await processResponse(response);
}
