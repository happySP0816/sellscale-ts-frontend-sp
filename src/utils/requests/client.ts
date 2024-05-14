import { API_URL } from '@constants/data';
import { MsgResponse } from 'src';
import { processResponse } from './utils';

/**
 * Get all SDRs for the client
 * @param userToken
 * @returns - MsgResponse
 */
export async function getClientSDRs(userToken: string): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/client/sdrs`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`,
    },
  });
  return await processResponse(response, 'data');
}
