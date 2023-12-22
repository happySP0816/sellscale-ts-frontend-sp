import { API_URL } from '@constants/data';
import { MsgResponse } from 'src';
import { processResponse } from './utils';

export async function findSimilarDomains(userToken: string, domain: string): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/domains/find-similar?domain=${domain}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  return await processResponse(response, 'data');
}

export async function findDomain(userToken: string, domain: string): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/domains/find?domain=${domain}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  return await processResponse(response, 'data');
}

// export async function purchaseDomain(userToken: string, domain: string): Promise<MsgResponse> {
//   const response = await fetch(`${API_URL}/domains/purchase`, {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${userToken}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       domain: domain,
//     }),
//   });
//   return await processResponse(response, 'data');
// }

export async function domainPurchaseWorkflow(
  userToken: string,
  domain: string,
  username: string,
  password: string
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/domains/purchase_workflow`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      domain: domain,
      username: username,
      password: password,
    }),
  });
  return await processResponse(response, 'data');
}
