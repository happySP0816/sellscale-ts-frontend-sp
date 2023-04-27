import { API_URL } from "@constants/data";
import { MsgResponse } from "src";
import getResponseJSON, { isMsgResponse } from "./utils";

/**
 * Gets the ICP classification prompt for the given archetype.
 * @param userToken
 * @param archetypeID
 * @returns - MsgResponse
 */
export default async function getICPClassificationPrompt(userToken: string, archetypeID: number): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/ml/icp_classification/icp_prompt/${archetypeID}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      }
    }
  );
  const result = await getResponseJSON("get_icp_prompt", response);
  if(isMsgResponse(result)) { return result; }

  return { status: 'success', title: `Success`, message: `Pulse prompt successfully retrieved.`, extra: result.data};
}
