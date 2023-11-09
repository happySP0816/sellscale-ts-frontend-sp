import { API_URL } from "@constants/data";
import { MsgResponse } from "src";
import { processResponse } from "./utils";

/**
 * 
 * @param userToken
 * @param templateType
 * @param archetypeID
 * @param templatePoolID
 * @param overallStatus
 * @param bumpedCount
 * @param transformerBlocklist
 * @returns - MsgResponse
 */
export default async function postCopyEmailPoolEntry(
  userToken: string,
  templateType: string,
  archetypeID: number,
  templatePoolID: number,
  overallStatus?: string | null,
  bumpedCount?: number | null,
  transformerBlocklist?: string[] | null
): Promise<MsgResponse> {
  
  const response = await fetch(
    `${API_URL}/email_sequence/pool/copy`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        template_type: templateType,
        archetype_id: archetypeID,
        template_pool_id: templatePoolID,
        overall_status: overallStatus,
        bumped_count: bumpedCount,
        transformer_blocklist: transformerBlocklist,
      }),
    }
  );
  return await processResponse(response);
}
