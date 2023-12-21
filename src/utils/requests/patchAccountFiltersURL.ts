import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Patches the account filters URL of a sales navigator launch
 * @param userToken - The token for user authorization.
 * @param launch_id - The ID of the sales navigator launch to be updated.
 * @param accountFiltersUrl - The new account filters URL to be set.
 * @returns - MsgResponse
 */
export async function patchSalesNavigatorLaunchAccountFiltersUrl(userToken: string, launch_id: number, accountFiltersUrl: string): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/automation/phantom_buster/sales_navigator/launch/${launch_id}/account_filters_url`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ account_filters_url: accountFiltersUrl })
    }
  );

  return await processResponse(response, 'data');
}
