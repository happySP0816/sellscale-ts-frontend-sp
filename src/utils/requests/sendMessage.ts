import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Send LinkedIn message to prospect
 * @param userToken
 * @param prospectId
 * @param message
 * @param aiGenerated
 * @param purgatory
 * @returns - MsgResponse
 */
export async function sendLinkedInMessage(
  userToken: string,
  prospectId: number,
  message: string,
  aiGenerated: boolean,
  purgatory?: boolean,
  bump_framework_id?: number,
  bump_framework_title?: string,
  bump_framework_description?: string,
  bump_framework_length?: string,
  account_research_points?: string[],
  purgatory_date?: Date,
  scheduled_send_date?: Date,
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/voyager/send_message`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prospect_id: prospectId,
      message: message,
      ai_generated: aiGenerated,
      purgatory: purgatory ?? true,
      bump_framework_id: bump_framework_id,
      bump_framework_title: bump_framework_title,
      bump_framework_description: bump_framework_description,
      bump_framework_length: bump_framework_length,
      account_research_points: account_research_points,
      purgatory_date: purgatory_date,
      scheduled_send_date: scheduled_send_date,
    }),
  });
  return await processResponse(response);
}
