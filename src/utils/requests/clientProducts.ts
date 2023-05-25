import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";


export async function getClientProducts(userToken: string): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/product`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return await processResponse(response, 'data');

}


export async function addClientProduct(
  userToken: string,
  name: string,
  description: string,
  how_it_works: string,
  use_cases: string,
  product_url: string
): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/product`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        description: description,
        how_it_works: how_it_works,
        use_cases: use_cases,
        product_url: product_url
      }),
    }
  );
  return await processResponse(response);

}


export async function updateClientProduct(
  userToken: string,
  product_id: number,
  name: string,
  description: string,
  how_it_works: string,
  use_cases: string,
  product_url: string
): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/product`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: product_id,
        name: name,
        description: description,
        how_it_works: how_it_works,
        use_cases: use_cases,
        product_url: product_url
      }),
    }
  );
  return await processResponse(response);

}

export async function removeClientProduct(userToken: string, product_id: number): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/product`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: product_id,
      }),
    }
  );
  return await processResponse(response);

}
