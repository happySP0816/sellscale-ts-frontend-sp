import { MsgResponse } from 'src';
import { processResponse } from './utils';
import { API_URL } from '@constants/data';

/**
 * Get message analytics report
 * @param userToken
 * @returns - MsgResponse
 */
export async function getMsgAnalyticsReport(userToken: string): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/client/msg_analytics_report`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  return await processResponse(response, 'data');
}
