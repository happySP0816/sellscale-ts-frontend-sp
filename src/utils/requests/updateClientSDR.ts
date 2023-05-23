import { API_URL } from "@constants/data";
import { MsgResponse } from "src";
import { processResponse } from "./utils";

export async function updateClientSDR(
  userToken: string,
  name: string,
  title: string,
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/client/sdr`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "name": name,
        "title": title,
      }),
    }
  );
  return await processResponse(response);
}