import { API_URL } from "@constants/data";
import { MsgResponse } from "src";
import { processResponse } from "./utils";

/**
 * Gets SDRs email banks
 * @param userToken
 * @returns - MsgResponse
 */
export default async function getEmailBanks(userToken: string): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/sdr/email/`,
    // `http://127.0.0.1:5000/client/sdr/email/`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );

  return await processResponse(response, "data");
}
