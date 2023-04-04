import { MsgResponse } from "src/main";
import getResponseJSON, { isMsgResponse } from "./utils";

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
    `${process.env.REACT_APP_API_URI}/ml/generate_sequence_value_props`,
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
  const result = await getResponseJSON("generate-sequence-value-props", response);
  if(isMsgResponse(result)) { return result; }

  return { status: 'success', title: `Success`, message: `Generated sequence value props`, extra: result.data };

}


export async function generateDraft(userToken: string, valueProps: string[], archetypeID: number): Promise<MsgResponse> {

  const response = await fetch(
    `${process.env.REACT_APP_API_URI}/ml/generate_sequence_draft`,
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
  const result = await getResponseJSON("generate-sequence-draft", response);
  if(isMsgResponse(result)) { return result; }

  return { status: 'success', title: `Success`, message: `Generated sequence draft`, extra: result.data };

}


export async function sendToOutreach(userToken: string, steps: string[]): Promise<MsgResponse> {

  const response = await fetch(
    `${process.env.REACT_APP_API_URI}/integration/outreach/send-sequence`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "steps": steps,
      }),
    }
  );
  const result = await getResponseJSON("send-sequence-steps", response);
  if(isMsgResponse(result)) { return result; }

  return { status: 'success', title: `Success`, message: `Sent sequence steps` };

}
