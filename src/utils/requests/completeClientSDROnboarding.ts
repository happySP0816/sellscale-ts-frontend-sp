import { API_URL } from "@constants/data";
import { MsgResponse } from "src";
import { processResponse } from "./utils";

export async function completeClientSDROnboarding(
  userToken: string,
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/client/sdr/complete-onboarding`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
      }),
    }
  );
  return await processResponse(response);
}