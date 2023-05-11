import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Get all sequences for a user
 * @param userToken
 * @returns - MsgResponse
 */
export async function getSequences(userToken: string): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/integration/sequences-auth`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  return await processResponse(response, 'sequence_options');
}

/**
 * Save a sequence to a given persona
 * @param userToken
 * @returns - MsgResponse
 */
export async function saveSequenceToPersona(
  userToken: string,
  personaId: string,
  sequenceId: string
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/integration/set-persona-sequence`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      persona_id: +personaId,
      sequence_id: sequenceId,
    }),
  });
  return await processResponse(response);
}
