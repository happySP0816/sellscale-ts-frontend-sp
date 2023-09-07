import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Get sales navigator launches
 * @param userToken 
 * @returns - MsgResponse
 */
export default async function getSalesNavigatorLaunches(userToken: string, personaId?: number): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/automation/phantom_buster/sales_navigator/launch` + (personaId ? `?client_archetype_id=${personaId}` : ``),
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return await processResponse(response, 'data');

}


/**
 * Get sales navigator launch
 * @param userToken
 * @param launch_id
 * @returns - boolean  
*/
export async function getSalesNavigatorLaunch(userToken: string, launch_id: number): Promise<boolean> {

  const response = await fetch(
    `${API_URL}/automation/phantom_buster/sales_navigator/launch/${launch_id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  // Create a temporary <a> element to initiate the download
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'launch_results.csv');
  document.body.appendChild(link);
  link.click();

  // Cleanup: remove the temporary <a> element and revoke the URL object
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);

  return true;
}
