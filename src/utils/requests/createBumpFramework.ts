import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Creates a bump framework
 * @param userToken
 * @param archetypeID
 * @param overallStatus
 * @param title
 * @param description
 * @param length
 * @param bumpedCount
 * @param bumpDelayDays
 * @param setDefault
 * @param substatus
 * @param setUseAccountResearch
 * @returns - MsgResponse
 */
export async function createBumpFramework(userToken: string, archetypID: number, overallStatus: string, title: string, description: string, length: string, bumpedCount: number | null, bumpDelayDays: number, setDefault: boolean, substatus: string | null = "", setUseAccountResearch: boolean, human_readable_prompt: string): Promise<MsgResponse> {
  if (!substatus) {
    substatus = "";
  }

  const response = await fetch(
    `${API_URL}/bump_framework/bump`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        archetype_id: archetypID,
        overall_status: overallStatus,
        title: title,
        description: description,
        default: setDefault,
        length: length,
        bumped_count: bumpedCount,
        bump_delay_days: bumpDelayDays,
        substatus: substatus,
        use_account_research: setUseAccountResearch,
        human_readable_prompt: human_readable_prompt
      })
    }
  );
  return await processResponse(response, 'bump_framework_id');

}
