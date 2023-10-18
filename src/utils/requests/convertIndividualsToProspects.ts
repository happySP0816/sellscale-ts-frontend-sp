import { Channel, MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Converts individuals to prospects
 * @param userToken 
 * @param archetypeId 
 * @param individualIds 
 * @returns - MsgResponse, data contains an array of prospect ids
 */
export async function convertIndividualsToProspects(
  userToken: string,
  archetypeId: number,
  individualIds: number[]
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/individual/convert-to-prospects`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      archetype_id: archetypeId,
      individual_ids: individualIds,
    }),
  });
  return await processResponse(response, 'data');
}
