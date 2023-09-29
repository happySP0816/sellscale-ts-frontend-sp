import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * 
 * @param userToken
 * @param clientArchetypeID
 * @returns - MsgResponse
 */
export async function getICPScoringJobs(
  userToken: string,
  clientArchetypeID: number
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/icp_scoring/runs?client_archetype_id=${clientArchetypeID}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return await processResponse(response, "data");
}
