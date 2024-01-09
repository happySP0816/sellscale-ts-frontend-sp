import { MsgResponse } from 'src';
import { processResponse } from './utils';
import { API_URL } from '@constants/data';

/**
 * Get warmup snapshots from smartlead
 * @param userToken
 * @returns - MsgResponse
 */
export async function getLIWarmupSnapshots(userToken: string): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/warmup/snapshots`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  return await processResponse(response, 'sdrs');
}
