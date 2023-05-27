import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Gets bump frameworks
 * @param userToken 
 * @param overallStatuses
 * @param substatuses
 * @param archetype_ids
 * @returns - MsgResponse
 */
export async function getBumpFrameworks(userToken: string, overallStatuses: string[], substatuses: string[], archetype_ids: number[]): Promise<MsgResponse> {
  const overall_statuses_string = overallStatuses.join(',');
  const substatuses_string = substatuses.join(',');
  const archetype_ids_string = archetype_ids.join(',');

  const response = await fetch(
    `${API_URL}/bump_framework/bump?overall_statuses=${overall_statuses_string}&substatuses=${substatuses_string}&archetype_ids=${archetype_ids_string}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      }
    }
  );
  return await processResponse(response, 'bump_frameworks');

}
