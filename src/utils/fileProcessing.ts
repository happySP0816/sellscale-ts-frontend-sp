import XLSX from "xlsx";

export async function convertFileToJSON(payload: File): Promise<any[] | DOMException> {

  console.log(`Converting File to JSON: ${payload.name} (${payload.size} bytes)...`)

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

  console.log('File converted to JSON (preview of first 20 rows):')
  console.table(json.slice(0, 20));
  return json

}
