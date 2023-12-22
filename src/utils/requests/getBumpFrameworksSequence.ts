import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Gets bump frameworks sequence
 * @param userToken 
 * @param archetype_id
 * @returns - MsgResponse
 */
export async function getBumpFrameworksSequence(
  userToken: string,
  archetype_id: number,
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/bump_framework/sequence?archetype_id=${archetype_id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      }
    }
  );
  return await processResponse(response);
}

