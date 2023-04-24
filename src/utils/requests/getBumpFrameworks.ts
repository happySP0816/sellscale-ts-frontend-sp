import { MsgResponse } from "src";
import getResponseJSON, { isMsgResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Gets bump frameworks
 * @param userToken 
 * @param overallStatus
 * @returns - MsgResponse
 */
export async function getBumpFrameworks(userToken: string, overallStatus: string): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/bump_framework/bump?overall_status=${overallStatus}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      }
    }
  );
  const result = await getResponseJSON("get-bump-frameworks", response);
  if(isMsgResponse(result)) { return result; }

  return { status: 'success', title: `Success`, message: `Bump frameworks retrieved`, extra: result.bump_frameworks };

}
