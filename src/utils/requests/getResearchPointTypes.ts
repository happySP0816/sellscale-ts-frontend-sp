import { MsgResponse } from 'src';
import { processResponse } from './utils';
import { API_URL } from '@constants/data';

export default async function getResearchPointTypes(userToken: string): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/research/all_research_point_types`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  return await processResponse(response, 'data');
}
