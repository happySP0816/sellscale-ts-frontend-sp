import { API_URL } from "@constants/data";
import { MsgResponse } from "src";
import { processResponse } from "./utils";

export async function getUsageConnectResponse(
  userToken: string,
  client_id: number
): Promise<MsgResponse> {
  console.log("sdfasdfasdfasdf", userToken, client_id);
  const response = await fetch(`${API_URL}/usage/${client_id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
  });
  console.log("000000000000000000", userToken, client_id);
  return await processResponse(response);
}
