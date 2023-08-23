import { API_URL } from "@constants/data";
import { MsgResponse } from "src";
import { processResponse } from "./utils";

export async function updateClientSDR(
  userToken: string,
  name?: string,
  title?: string,
  disable_ai_on_prospect_respond?: boolean,
  disable_ai_on_message_send?: boolean,
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/client/sdr`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "name": name,
        "title": title,
        "disable_ai_on_prospect_respond": disable_ai_on_prospect_respond,
        "disable_ai_on_message_send": disable_ai_on_message_send,
      }),
    }
  );
  return await processResponse(response);
}


export async function updateConversionPercentages(
  userToken: string,
  active_convo: number,
  scheduling: number,
  demo_set: number,
  demo_won: number,
  not_interested: number,
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/client/sdr/conversion_percentages`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "active_convo": active_convo,
        "scheduling": scheduling,
        "demo_set": demo_set,
        "demo_won": demo_won,
        "not_interested": not_interested
      }),
    }
  );
  return await processResponse(response);
}
