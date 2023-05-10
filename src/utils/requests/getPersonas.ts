import { logout } from "@auth/core";
import { showNotification } from "@mantine/notifications";
import { MsgResponse } from "src";
import getResponseJSON, { isMsgResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Get all personas for a user
 * @param userToken 
 * @returns - MsgResponse
 */
export default async function getPersonas(userToken: string): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/archetype/get_archetypes`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  const result = await getResponseJSON("personas-get", response);
  if(isMsgResponse(result)) { return result; }

  return { status: 'success', title: `Success`, message: `Gathered personas`, extra: result.archetypes };

}


/**
 * Get all personas for a user
 * @param userToken 
 * @returns - MsgResponse
 */
export async function getPersonasOverview(userToken: string): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/archetype/get_archetypes/overview`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  const result = await getResponseJSON("personas-get-overview", response);
  if(isMsgResponse(result)) { return result; }

  return { status: 'success', title: `Success`, message: `Gathered personas overview`, extra: result.data };

}


/**
 * Get all uploads for a persona
 * @param userToken 
 * @param personaId 
 * @returns - MsgResponse
 */
export async function getAllUploads(userToken: string, personaId: number): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/archetype/${personaId}/all_uploads`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  const result = await getResponseJSON("uploads-all-get", response);
  if(isMsgResponse(result)) { return result; }

  const uploads = await Promise.all(result.uploads.map(async (upload: any) => {
    const statsResult = await getUploadStats(userToken, upload.id);
    return {
      ...upload,
      stats: statsResult.status === 'success' ? statsResult.extra : {},
    };
  }));

  return { status: 'success', title: `Success`, message: `Gathered all uploads`, extra: uploads };

}

/**
 * Get stats for a single upload
 * @param userToken 
 * @param uploadId 
 * @returns - MsgResponse
 */
export async function getUploadStats(userToken: string, uploadId: number): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/prospect_upload/${uploadId}/stats`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  const result = await getResponseJSON("uploads-stats-get", response);
  if(isMsgResponse(result)) { return result; }

  return { status: 'success', title: `Success`, message: `Gathered upload stats`, extra: result.stats };

}


/**
 * Get details for a single upload
 * @param userToken 
 * @param uploadId 
 * @returns - MsgResponse
 */
export async function getUploadDetails(userToken: string, uploadId: number): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/prospect_upload/${uploadId}/details`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  const result = await getResponseJSON("uploads-details-get", response);
  if(isMsgResponse(result)) { return result; }

  return { status: 'success', title: `Success`, message: `Gathered upload details`, extra: result.uploads };

}
