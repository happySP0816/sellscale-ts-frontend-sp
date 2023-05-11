import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Gets research points (heuristic version) for a given prospect
 * @param userToken 
 * @param prospectID
 * @returns - MsgResponse
 */
export async function getResearchPointsHeuristic(userToken: string, prospectID: number): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/research/research_points/heuristic?prospect_id=${prospectID}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      }
    }
  );
  return await processResponse(response, 'research_points');

}
