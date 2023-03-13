import { MsgResponse } from "src/main";
import getResponseJSON, { isMsgResponse } from "./utils";

/**
 * Get all transformers for an archetype
 * @param userToken 
 * @returns - MsgResponse
 */
export default async function getTransformers(userToken: string, archetype_id: number): Promise<MsgResponse> {

  const response = await fetch(
    `${process.env.REACT_APP_API_URI}/client/archetype/${archetype_id}/transformers`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  const result = await getResponseJSON("transformers-get", response);
  if(isMsgResponse(result)) { return result; }

  return { status: 'success', title: `Success`, message: `Gathered transformers`, extra: result.stats };

}