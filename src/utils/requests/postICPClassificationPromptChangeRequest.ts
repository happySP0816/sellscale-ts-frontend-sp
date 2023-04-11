import { API_URL } from "@constants/data";
import { showNotification } from "@mantine/notifications";
import { MsgResponse } from "src";
import getResponseJSON, { isMsgResponse } from "./utils";

export default async function postICPClassificationPromptChangeRequest(userToken: string, archetypeID: number, newPrompt: string): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/ml/icp_classification/icp_prompt/${archetypeID}/request_update`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        new_prompt: newPrompt,
      }),
    }
  );
  const result = await getResponseJSON("all-emails-get", response);
  if(isMsgResponse(result)) { return result; }

  return { status: 'success', title: `Success`, message: `Requested Pulse Prompt Change` };
}
