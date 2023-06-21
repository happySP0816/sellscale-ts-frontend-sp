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
 * @param setDefault
 * @param substatus
 * @returns - MsgResponse
 */
export async function createBumpFramework(userToken: string, archetypID: number, overallStatus: string, title: string, description: string, length: string, bumpedCount: number | null, setDefault: boolean, substatus: string | null = ""): Promise<MsgResponse> {
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
        substatus: substatus
      })
    }
  );
  return await processResponse(response, 'bump_framework_id');

}


/**
 * Creates an email bump framework
 * @param userToken
 * @param archetypeID
 * @param overallStatus
 * @param title
 * @param email_blocks
 * @param bumpedCount
 * @param setDefault
 * @param substatus
 * @returns - MsgResponse
 */
export async function createEmailBumpFramework(userToken: string, archetypID: number, overallStatus: string, title: string, email_blocks: string[], bumpedCount: number | null, setDefault: boolean, substatus: string | null = ""): Promise<MsgResponse> {
  if (!substatus) {
    substatus = "";
  }

  const response = await fetch(
    `${API_URL}/bump_framework_email/bump`,
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
        email_blocks: email_blocks,
        default: setDefault,
        bumped_count: bumpedCount,
        substatus: substatus
      })
    }
  );
  return await processResponse(response, 'bump_framework_id');

}
