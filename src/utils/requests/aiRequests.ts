import { MsgResponse } from 'src';
import { processResponse } from './utils';
import { API_URL } from '@constants/data';

export async function addCampaignAiRequest(
  userToken: string,
  name: string,
  description: string,
  linkedin: boolean,
  email: boolean,
  segmentId?: number
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/campaigns/create_campaign_ai_request`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      description,
      linkedin,
      email,
      segmentId,
    }),
  });
  return await processResponse(response, 'data');
}
