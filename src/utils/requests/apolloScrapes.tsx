import { MsgResponse } from 'src';
import { processResponse } from './utils';
import { API_URL } from '@constants/data';

export async function upsertAndRunApolloScrape(
  userToken: string,
  name: string,
  archetypeId?: number,
  segmentId?: number
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/prospect/apollo_scrape`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      archetype_id: archetypeId,
      segment_id: segmentId,
    }),
  });
  return await processResponse(response, 'data');
}

export async function getApolloScrapes(userToken: string): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/prospect/apollo_scrape`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  return await processResponse(response, 'data');
}

export async function updateApolloScrape(
  userToken: string,
  jobId: number,
  name?: string,
  active?: boolean,
  updateFilters?: boolean
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/prospect/apollo_scrape`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      job_id: jobId,
      name,
      active,
      update_filters: updateFilters,
    }),
  });
  return await processResponse(response, 'data');
}
