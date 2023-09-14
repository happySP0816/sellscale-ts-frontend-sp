import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Modifies a bump framework
 * @param userToken 
 * @param bumpFrameworkID
 * @param overallStatus
 * @param title
 * @param description
 * @param length
 * @param bumpedCount
 * @param bumpDelayDays
 * @param setDefault
 * @param setUseAccountResearch
 * @param blocklist
 * @returns - MsgResponse
 */
export async function patchBumpFramework(userToken: string, bumpFrameworkID: number, overallStatus: string, title: string, description: string, length: string, bumpedCount: number | null, bumpDelayDays: number | null, setDefault: boolean, setUseAccountResearch: boolean, blocklist?: string[]): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/bump_framework/bump`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bump_framework_id: bumpFrameworkID,
        overall_status: overallStatus,
        title: title,
        description: description,
        default: setDefault,
        length: length,
        bumped_count: bumpedCount,
        bump_delay_days: bumpDelayDays,
        use_account_research: setUseAccountResearch,
        blocklist: blocklist,
      })
    }
  );
  return await processResponse(response);

}
