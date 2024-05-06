import { MsgResponse } from 'src';
import { processResponse } from './utils';
import { API_URL } from '@constants/data';

/**
 * Gets the inbox counts for the user
 * @param userToken
 * @returns - MsgResponse
 */
export async function getInboxCounts(userToken: string): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/analytics/inbox_messages_to_view`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  return await processResponse(response, 'data');
}
