import { MsgResponse } from 'src';
import { processResponse } from './utils';
import { API_URL } from '@constants/data';

export async function setDemoSetProspect(
  userToken: string,
  prospectID: number,
  type: string,
  description: string
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/prospect/${prospectID}/demo_set`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: type,
      description: description,
    }),
  });

  return await processResponse(response);
}
