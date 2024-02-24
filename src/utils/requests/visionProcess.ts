import { MsgResponse } from 'src';
import { processResponse } from './utils';
import { API_URL } from '@constants/data';

export async function processVision(
  userToken: string,
  message: string,
  options: {
    webpage_url?: string;
    image_url?: string;
    image_contents?: string;
    max_tokens?: number;
  }
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/client/query_gpt_v`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      webpage_url: options.webpage_url,
      image_url: options.image_url,
      image_contents: options.image_contents,
      max_tokens: options.max_tokens,
    }),
  });
  return await processResponse(response, 'data');
}
