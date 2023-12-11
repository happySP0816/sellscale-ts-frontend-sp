import { API_URL } from '@constants/data';
import { MsgResponse } from 'src';
import { processResponse } from './utils';

export async function getTrigger(userToken: string, triggerId: number): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/triggers/trigger/${triggerId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  return await processResponse(response);
}

export async function createTrigger(userToken: string, archetypeId: number): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/triggers/trigger`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      archetype_id: archetypeId,
    }),
  });
  return await processResponse(response);
}

export async function updateTrigger(
  userToken: string,
  triggerId: number,
  emoji?: string,
  name?: string,
  description?: string,
  intervalInMinutes?: number,
  active?: boolean,
  blocks?: Record<string, any>[],
  campaignId?: number
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/triggers/trigger/${triggerId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      emoji,
      name,
      description,
      interval_in_minutes: intervalInMinutes,
      active,
      blocks,
      campaign_id: campaignId,
    }),
  });
  return await processResponse(response);
}

export async function runTrigger(userToken: string, triggerId: number): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/triggers/trigger/run/${triggerId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });
  return await processResponse(response);
}
