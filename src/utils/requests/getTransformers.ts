import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Get all transformers for an archetype
 * @param userToken 
 * @returns - MsgResponse
 */
export default async function getTransformers(userToken: string, archetype_id: number, isEmail: boolean): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/archetype/${archetype_id}/transformers?email=${isEmail}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return await processResponse(response, 'stats');

}