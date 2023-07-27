import { API_URL } from "@constants/data";
import { MsgResponse } from "src";
import { processResponse } from "./utils";

/**
 * Launches a sales navigator scrape
 * @param userToken
 * @param sales_navigator_url
 * @param scrape_count
 * @param name
 * @returns - MsgResponse
 */
export default async function postLaunchSalesNavigator(userToken: string, sales_navigator_url: string, scrape_count: number, name: string): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/automation/phantom_buster/sales_navigator/launch`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sales_navigator_url: sales_navigator_url,
        scrape_count: scrape_count,
        name: name,
      }),
    }
  );

  return await processResponse(response);
}
