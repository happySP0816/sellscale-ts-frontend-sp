import { API_URL } from "@constants/data";
import { showNotification } from "@mantine/notifications";
import { MsgResponse } from "src";
import getResponseJSON, { isMsgResponse } from "./utils";

/**
 * Runs the ICP Classification model for a given archetype
 * @param userToken
 * @param archetypeID
 * @returns - MsgResponse
 */
export default async function postRunICPClassification(userToken: string, archetypeID: number): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/ml/icp_classification/trigger/${archetypeID}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prospect_ids: []
      }),
    }
  );
  const result = await getResponseJSON("run-icp-classify", response);
  if(isMsgResponse(result)) { return result; }

  return { status: 'success', title: `Success`, message: `ICP classify triggered successfully.` };
}
