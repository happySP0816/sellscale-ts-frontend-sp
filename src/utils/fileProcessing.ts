import XLSX from "xlsx";


export async function convertFileToJSON(payload: File): Promise<any[] | DOMException> {

  const reader = new FileReader();
  reader.readAsBinaryString(payload);

  const fileContents = await new Promise((res, rej) => {
    reader.onload = function(e){
      res(e.target?.result);
    }
  });

  let json: any[] = [];
  try {
    const workbook = XLSX.read(fileContents, { type: 'binary' });
    if(workbook.SheetNames.length > 0){
      // Only read first sheet of file
      json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    }
  } catch(e){
    console.error(e);
    return e as DOMException;
  }

  console.log(json);
  return json

}

export async function uploadSheet(archetype_id: number, userToken: string, payload: File): Promise<{ status: string, title: string, message: string, extra?: any }> {

  const json = await convertFileToJSON(payload);
  if(json instanceof DOMException){
    return { status: 'error', title: `Error while parsing file`, message: json+'' };
  }

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
      return { status: 'error', title: `Error (${r.status})`, message: await r.text() };
    }
  }).catch((err) => {
    console.log(err);
    return { status: 'error', title: `Error while uploading`, message: err.message };
  });

}
