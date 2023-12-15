import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Gets bump frameworks
 * @param userToken 
 * @param overallStatuses
 * @param substatuses
 * @param archetype_ids
 * @param excludeArchetypeIDs
 * @param excludeSSDefault
 * @param uniqueOnly
 * @param bumpedCount
 * @returns - MsgResponse
 */
export async function getBumpFrameworks(
  userToken: string,
  overallStatuses: string[],
  substatuses: string[],
  archetype_ids: number[],
  excludeArchetypeIDs?: number[],
  excludeSSDefault?: boolean,
  uniqueOnly?: boolean,
  bumpedCount?: number
): Promise<MsgResponse> {
  const overall_statuses_string = overallStatuses.join(',');
  const substatuses_string = substatuses.join(',');
  const archetype_ids_string = archetype_ids.join(',');
  const exclude_archetype_ids_string = excludeArchetypeIDs ? excludeArchetypeIDs.join(',') : '';
  const exclude_ss_default = excludeSSDefault ? 'true' : 'false';
  const unique_only = uniqueOnly ? 'true' : 'false';

  const response = await fetch(
    `${API_URL}/bump_framework/bump?overall_statuses=${overall_statuses_string}&substatuses=${substatuses_string}&archetype_ids=${archetype_ids_string}&exclude_client_archetype_ids=${exclude_archetype_ids_string}&exclude_ss_default=${exclude_ss_default}&unique_only=${unique_only}` + (bumpedCount ? `&bumped_count=${bumpedCount}` : ''),
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      }
    }
  );
  return await processResponse(response);

}


/**
 * Gets single bump framework
 * @param userToken
 * @param bumpID
 * @returns - MsgResponse
 */
export async function getSingleBumpFramework(userToken: string, bumpID: number): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/bump_framework/bump/${bumpID}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      }
    }
  );
  return await processResponse(response, "data");

}

export async function getBumpFrameworkMessages(userToken: string, bumpID: number): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/bump_framework/bump-messages?bump_id=${bumpID}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      }
    }
  );
  return await processResponse(response, "data");
}