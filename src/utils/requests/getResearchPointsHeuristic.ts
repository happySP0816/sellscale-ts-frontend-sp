import { MsgResponse } from "src";
import getResponseJSON, { isMsgResponse } from "./utils";
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
  const result = await getResponseJSON("get-prospect-research-points-by-id", response);
  if(isMsgResponse(result)) { return result; }

  return { status: 'success', title: `Success`, message: `Research points retrieved`, extra: result.research_points };

}
