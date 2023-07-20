import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Modifies a prospect's information
 * @param userToken 
 * @param prospectID
 * @param title
 * @param email
 * @param linkedin_url
 * @param company_name
 * @param company_website
 * @returns - MsgResponse
 */
export async function patchProspect(
  userToken: string,
  prospectID: number,
  title?: string,
  email?: string,
  linkedin_url?: string,
  company_name?: string,
  company_website?: string,
): Promise<MsgResponse> {

  console.log(
    JSON.stringify({
      "title": title,
        "email": email,
        "linkedin_url": linkedin_url,
        "company_name": company_name,
        "company_website": company_website,
    })
  )
  const response = await fetch(
    `${API_URL}/prospect/${prospectID}/entity`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "title": title,
        "email": email,
        "linkedin_url": linkedin_url,
        "company_name": company_name,
        "company_website": company_website,
      }),
    }
  );

  return await processResponse(response);

}