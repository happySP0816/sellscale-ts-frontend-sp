import XLSX from 'xlsx';

export async function convertFileToJSON(payload: File): Promise<any[] | DOMException> {
  const reader = new FileReader();
  reader.readAsBinaryString(payload);

  const fileContents = await new Promise((res, rej) => {
    reader.onload = function (e) {
      res(e.target?.result);
    };
  });

  let json: any[] = [];
  try {
    const workbook = XLSX.read(fileContents, { type: 'binary' });
    if (workbook.SheetNames.length > 0) {
      // Only read first sheet of file
      json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    }
  } catch (e) {
    console.error(e);
    return e as DOMException;
  }

  return json;
}

export function csvStringToArray(csvString: string) {
  // Step 1: Convert the CSV string to a workbook
  const workbook = XLSX.read(csvString, { type: 'string' });

  // Step 2: Get the first sheet's name and use it to access the sheet
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Step 3: Convert the sheet to JSON
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  // The jsonData is an array of arrays. Each sub-array is a row in the CSV.
  // Since we have only one row, we take the first element (which is an array of our values).
  return jsonData[0];
}
