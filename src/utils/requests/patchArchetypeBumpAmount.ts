import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Changes the li bump amount
 * @param userToken 
 * @param archetypeID
 * @param bumpAmount
 * @returns - MsgResponse
 */
export async function patchArchetypeBumpAmount(
  userToken: string, 
  archetypeID: number, 
  bumpAmount: number
): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/archetype/${archetypeID}/li_bump_amount`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bump_amount: bumpAmount,
      })
    }
  );
  return await processResponse(response);

}
