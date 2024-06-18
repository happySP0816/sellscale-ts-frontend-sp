import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Gets all domain details
 * @param userToken
 * @returns - MsgResponse
 */
export default async function getDomainDetails(
  userToken: string,
  includeClientEmailBanks: boolean = false
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/domains/all?include_client_email_banks=${includeClientEmailBanks}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );

  return await processResponse(response, "data");
}
