import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";


export async function getEmailFollowupPrompt(
  userToken: string,
  prospectId: number,
  threadId: string,
  objective?: string,
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/ml/get_generate_followup_email_prompt`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prospect_id: prospectId,
      thread_id: threadId,
      objective: objective,
    }),
  });
  return await processResponse(response);
}
