import { API_URL } from "@constants/data";
import { showNotification } from "@mantine/notifications";
import { MsgResponse } from "src";
import { processResponse } from "./utils";

/**
 * Runs the ICP Classification model for a given archetype
 * @param userToken
 * @param archetypeID
 * @returns - MsgResponse
 */
export default async function postRunICPClassification(userToken: string, archetypeID: number, prospect_ids?: number[]): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/ml/icp_classification/trigger/${archetypeID}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prospect_ids: prospect_ids || []
      }),
    }
  );
  return await processResponse(response);
}
