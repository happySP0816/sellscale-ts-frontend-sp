import { MsgResponse } from "src";
import getResponseJSON, { isMsgResponse } from "./utils";
import { API_URL } from "@constants/data";

export default async function uploadProspects(archetype_id: number, userToken: string, usingEmail: boolean, json: any[]): Promise<MsgResponse> {

  return await fetch(
    `${API_URL}/prospect/add_prospect_from_csv_payload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        archetype_id: archetype_id,
        csv_payload: json,
        email_enabled: usingEmail,
      }),
    }
  ).then(async (r) => {
    if(r.status === 200){
      return { status: 'success', title: `Success`, message: `Prospects added to persona.` };
    } else {
      let text = await r.text();
      if(r.status === 400 && text.startsWith('Duplicate CSVs are not allowed')){
        return await retriggerUploadJob(userToken, archetype_id);
      } else {
        return { status: 'error', title: `Error (${r.status})`, message: text };
      }
    }
  }).catch((err) => {
    console.warn(err);
    return { status: 'error', title: `Error while uploading`, message: err.message };
  }) as MsgResponse;

}


/**
 * Retriggers the last upload job
 * @param userToken 
 * @param archetype_id 
 * @returns - MsgResponse
 */
export async function retriggerUploadJob(userToken: string, archetype_id: number): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/prospect/retrigger_upload_job`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        archetype_id: archetype_id
      }),
    }
  );
  const result = await getResponseJSON("uploads-retrigger-last", response);
  if(isMsgResponse(result)) { return result; }

  return { status: 'success', title: `Success`, message: `Retriggered last upload` };

}
