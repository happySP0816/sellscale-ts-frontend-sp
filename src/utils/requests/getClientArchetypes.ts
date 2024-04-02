import { MsgResponse } from 'src';
import { processResponse } from './utils';
import { API_URL } from '@constants/data';

/**
 * Gets all archetypes for a client
 * @param userToken
 * @param client_id
 * @returns - MsgResponse
 */
export async function getClientArchetypes(
  userToken: string,
  client_id: number
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/client/all_archetypes?client_id=${client_id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  return await processResponse(response, 'data');
}
