import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Clones a bump framework
 * @param userToken
 * @param archetypeID
 * @param bumpFrameworkID
 * @returns - MsgResponse
 */
export async function cloneBumpFramework(userToken: string, archetypID: number, bumpFrameworkID: number): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/bump_framework/bump/clone`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        existent_bump_framework_id: bumpFrameworkID,
        new_archetype_id: archetypID,
      })
    }
  );
  return await processResponse(response, 'data');

}
