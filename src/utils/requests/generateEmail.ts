import { MsgResponse } from "src";
import getResponseJSON, { isMsgResponse } from "./utils";
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
  const result = await getResponseJSON("email-generate", response);
  if (isMsgResponse(result)) {
    return result;
  }

  return {
    status: "success",
    title: `Success`,
    message: `Generated email`,
    extra: result.data,
  };
}

export async function getEmailGenerationPrompt(
  userToken: string,
  prospectId: number
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/ml/get_generate_email_prompt`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prospect_id: prospectId }),
  });

  const result = await getResponseJSON("email-generate-prompt", response);
  if (isMsgResponse(result)) {
    return result;
  }

  return {
    status: "success",
    title: `Success`,
    message: `Generated email prompt`,
    extra: result,
  };
}
