import { MsgResponse } from 'src';
import { processResponse } from './utils';
import { API_URL } from '@constants/data';

/**
 * Gets the SDR access for a client
 * TODO: This endpoint is unrestricted as a way to get SDR-access from a client ID
 *  - Gotta be careful with this one and lock this down in the future
 * @param userToken
 * @returns - MsgResponse
 */
export async function getClientSdrAccess(
  userToken: string,
  client_id: number
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/client/sdr_access?client_id=${client_id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  return await processResponse(response, 'data');
}
