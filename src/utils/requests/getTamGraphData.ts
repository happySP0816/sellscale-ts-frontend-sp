import { MsgResponse } from 'src';
import { processResponse } from './utils';
import { API_URL } from '@constants/data';

/**
 * Get TAM Graph Data
 * @param userToken
 * @returns - MsgResponse
 */
export async function getTamGraphData(userToken: string): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/client/tam_graph_data`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  return await processResponse(response, 'data');
}
