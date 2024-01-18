import { MsgResponse } from 'src';
import { processResponse } from './utils';
import { API_URL } from '@constants/data';

export async function postGenerateMultichannelEmail(
  userToken: string,
  prospectId: number,
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/message_generation/email/multichannel_email`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prospect_id: prospectId,
    }),
  });
  return await processResponse(response, 'data');
}