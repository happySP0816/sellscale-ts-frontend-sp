import { logout } from "@auth/core";
import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Gets all email blocks for a persona
 * @param userToken
 * @param archetypeId
 * @param EmailSequenceStepID
 * @returns - MsgResponse
 */
export default async function getEmailBlocks(userToken: string, archetypeId: number, EmailSequenceStepID?: number): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/archetype/${archetypeId}/email_blocks${EmailSequenceStepID ? ('/' + EmailSequenceStepID) : ''}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return await processResponse(response, 'data');

}
