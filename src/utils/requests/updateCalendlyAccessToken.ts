import { API_URL } from "@constants/data";
import { MsgResponse } from "src";
import { processResponse } from "./utils";

export async function updateCalendlyAccessToken(
  userToken: string,
  code: string,
): Promise<MsgResponse> {
  console.log("updateCalendlyAccessToken", code)
  const response = await fetch(
    `${API_URL}/calendly/access_token`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "code": code,
      }),
    }
  );
  return await processResponse(response);
}