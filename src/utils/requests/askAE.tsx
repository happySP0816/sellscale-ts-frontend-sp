import { MsgResponse } from 'src';
import { processResponse } from './utils';
import { API_URL } from '@constants/data';

/**
 * Send ask AE notification
 * @param userToken
 * @returns - MsgResponse
 */
export async function sendAskAE(
  userToken: string,
  prospectId: number,
  question: string
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/client/ask_ae_notifs`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prospect_id: prospectId,
      question,
    }),
  });
  return await processResponse(response, 'data');
}
