import { MsgResponse } from 'src';
import { processResponse } from './utils';
import { API_URL } from '@constants/data';

/**
 * Gets all clients
 * @param userToken
 * @returns - MsgResponse
 */
export async function getClients(userToken: string): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/client/all`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  return await processResponse(response, 'data');
}
