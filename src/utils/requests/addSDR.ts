import { logout } from '@auth/core';
import { API_URL } from '@constants/data';
import { showNotification } from '@mantine/notifications';
import { MsgResponse } from 'src';
import { processResponse } from './utils';

export default async function addSDR(
  userToken: string,
  sdrName: string,
  liUrl: string,
  email: string
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/client/sdr/add_seat`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: sdrName,
      email: email,
      linkedin_url: liUrl,
    }),
  });
  return await processResponse(response);
}

export async function updateCTA(
  userToken: string,
  cta_id: number,
  text_value: string,
  expirationDate?: Date,
  markAsScheduling?: boolean,
  cta_type?: string
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/message_generation/cta`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cta_id: cta_id,
      text_value: text_value,
      expiration_date: expirationDate?.toISOString(),
      auto_mark_as_scheduling_on_acceptance: markAsScheduling,
      cta_type: cta_type,
    }),
  });
  return await processResponse(response);
}

export async function deleteCTA(userToken: string, cta_id: number): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/message_generation/cta`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cta_id: cta_id,
    }),
  });
  return await processResponse(response);
}
