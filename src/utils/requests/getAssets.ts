import { MsgResponse } from 'src';
import { processResponse } from './utils';
import { API_URL } from '@constants/data';

/**
 * Gets Assets for a campaign
 * @param userToken
 * @param campaignID
 * @returns - MsgResponse
 */
export async function getSDRAssets(
  userToken: string,
  campaignID: number
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/client/archetype/assets/${campaignID}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  return await processResponse(response, 'data');
}