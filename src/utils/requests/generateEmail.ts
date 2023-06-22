import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

export async function generateEmail(
  userToken: string,
  prompt: string
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/ml/generate_email`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt: prompt }),
  });
  return await processResponse(response, 'data');
}

export async function generateEmailAutomatic(
  userToken: string,
  prospect_id: number,
  emailBlocks?: string[],
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/ml/generate_email_automatic`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prospect_id: prospect_id,
      email_blocks: emailBlocks,
    }),
  });
  return await processResponse(response, 'data');
}


export async function getEmailGenerationPrompt(
  userToken: string,
  prospectId: number,
  bumpFrameworkId?: number,
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/ml/get_generate_email_prompt`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prospect_id: prospectId,
      bump_framework_id: bumpFrameworkId,
    }),
  });
  return await processResponse(response);
}
