import { MsgResponse } from 'src';
import { processResponse } from './utils';
import { API_URL } from '@constants/data';

export default async function getResearchPointTypes(userToken: string, archetype_id?: number): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/research/all_research_point_types?archetype_id=${archetype_id ? archetype_id : ""}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  return await processResponse(response, 'data');
}

export async function getResearchPoint(userToken: string, prospect_id: number): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/research/research_points/${prospect_id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  return await processResponse(response, 'data');
}

