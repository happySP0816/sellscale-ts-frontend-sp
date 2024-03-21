import { MsgResponse } from 'src';
import { processResponse } from './utils';
import { API_URL } from '@constants/data';

/**
 * Modifies WarmupSchedule entries in a bulk fashion
 * @returns - MsgResponse
 */
export async function patchWarmupSchedule(
  userToken: string,
  schedule_volume_map: any,
  new_max_li_target?: number,
  new_max_email_target?: number,
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/client/sdr/sla/schedule/bulk`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      schedule_volume_map,
      new_max_li_target,
      new_max_email_target,
    }),
  });

  return await processResponse(response);
}