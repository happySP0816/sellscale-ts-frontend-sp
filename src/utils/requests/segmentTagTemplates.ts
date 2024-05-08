import { API_URL } from "@constants/data";
import { processResponse } from "./utils";

export async function createSegmentTag(userToken: string, segment_id: number, name: string, color: string) {
  const response = await fetch(`${API_URL}/segment/tags/create`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      segment_id,
      name,
      color,
    }),
  });

  return await processResponse(response);
}

export async function getSegmentTag(userToken: string, tag_id: number) {
  const response = await fetch(`${API_URL}/segment/tags/${tag_id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  return await processResponse(response);
}

export async function getAllSegmentTags(userToken: string) {
  const response = await fetch(`${API_URL}/segment/tags`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  return await processResponse(response);
}

export async function updateSegmentTag(userToken: string, tag_id: number, name?: string, color?: string) {
  const response = await fetch(`${API_URL}/segment/tags/${tag_id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      color,
    }),
  });

  return await processResponse(response);
}

export async function deleteSegmentTag(userToken: string, tag_id: number) {
  const response = await fetch(`${API_URL}/segment/tags/${tag_id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  return await processResponse(response);
}

export async function addTagToSegment(userToken: string, segment_id: number, tag_id: number) {
  const response = await fetch(`${API_URL}/segment/tags/add`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tag_id,
      segment_id,
    }),
  });

  return await processResponse(response);
}

export async function removeTagFromSegment(userToken: string, segment_id: number, tag_id: number) {
  const response = await fetch(`${API_URL}/segment/tags/remove`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tag_id,
      segment_id,
    }),
  });

  return await processResponse(response);
}

export async function updateTagsForSegment(userToken: string, segment_id: number, new_tag_ids: number[]) {
  const response = await fetch(`${API_URL}/segment/${segment_id}/tags/update`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tag_ids: new_tag_ids,
    }),
  });

  return await processResponse(response);
}