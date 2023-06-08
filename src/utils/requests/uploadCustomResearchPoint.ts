import { MsgResponse } from "src";
import { isMsgResponse, processResponse } from "./utils";
import { API_URL } from "@constants/data";

export default async function uploadCustomResearchPoint(
  userToken: string,
  label: string,
  entries: { li_url?: string, email?: string, value: string }[]
): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/research/custom_research_point/upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        label,
        entries,
      }),
    }
  );
  return await processResponse(response);

}
