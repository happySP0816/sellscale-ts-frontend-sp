import { MsgResponse } from 'src';
import { processResponse } from './utils';
import { API_URL } from '@constants/data';

export async function getActivityLogs(userToken: string): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/analytics/activity_log`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  return await processResponse(response, 'data');
}

export async function addActivityLog(
  userToken: string,
  type: string,
  name: string,
  description: string
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/analytics/activity_log`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type,
      name,
      description,
    }),
  });
  return await processResponse(response, 'data');
}
