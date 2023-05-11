import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Generates value props for sequence
 * @param userToken 
 * @param company 
 * @param sellingTo 
 * @param sellingWhat 
 * @param num 
 * @returns - MsgResponse
 */
export async function generateValueProps(userToken: string, company: string, sellingTo: string, sellingWhat: string, num: number): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/ml/generate_sequence_value_props`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "company": company,
        "selling_to": sellingTo,
        "selling_what": sellingWhat,
        "num": num,
      }),
    }
  );
  return await processResponse(response, 'data');

}


export async function generateDraft(userToken: string, valueProps: string[], archetypeID: number): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/ml/generate_sequence_draft`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "value_props": valueProps,
        "archetype_id": archetypeID,
      }),
    }
  );
  return await processResponse(response, 'data');

}


export async function sendToOutreach(userToken: string, title: string, archetype_id: number, steps: { subject: string, body: string }[]): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/email_generation/add_sequence`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "title": title,
        "archetype_id": archetype_id,
        "data": steps,
      }),
    }
  );
  return await processResponse(response);

}
