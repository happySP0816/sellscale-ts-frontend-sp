import { MsgResponse } from "src/main";

export default async function uploadProspects(archetype_id: number, userToken: string, json: any[]): Promise<MsgResponse> {

  return await fetch(
    `${process.env.REACT_APP_API_URI}/prospect/add_prospect_from_csv_payload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        archetype_id: archetype_id,
        csv_payload: json,
      }),
    }
  ).then(async (r) => {
    if(r.status === 200){
      return { status: 'success', title: `Success`, message: `Contacts added to persona.` };
    } else {
      return { status: 'error', title: `Error (${r.status})`, message: (await r.text()) };
    }
  }).catch((err) => {
    console.warn(err);
    return { status: 'error', title: `Error while uploading`, message: err.message };
  }) as MsgResponse;

}
