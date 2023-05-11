import { logout } from "@auth/core";
import { showNotification } from "@mantine/notifications";
import { MsgResponse } from "src";
import { processResponse } from "./utils";
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
  return processResponse(response, 'archetypes');

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
  return processResponse(response, 'data');

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
  const msgResponse = await processResponse(response, 'uploads');

  const uploads = await Promise.all(msgResponse.data.map(async (upload: any) => {
    const statsResult = await getUploadStats(userToken, upload.id);
    return {
      ...upload,
      stats: statsResult.status === 'success' ? statsResult.data : {},
    };
  }));

  return { status: 'success', title: `Success`, message: `Gathered all uploads`, data: uploads };

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
  return processResponse(response, 'stats');

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
  return processResponse(response, 'uploads');

}
