import { API_URL } from "@constants/data";
import { MsgResponse } from "src";
import { processResponse } from "./utils";

export async function getUsageConnectResponse(
  userToken: string,
  client_id: number
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/usage/?client_id=${client_id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
  });
  return await processResponse(response);
}
