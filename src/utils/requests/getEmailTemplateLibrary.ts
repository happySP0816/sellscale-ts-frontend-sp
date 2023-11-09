import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";


/**
 * Get email template library
 * @param userToken
 * @param templateType
 * @returns
**/
export async function getEmailTemplateLibrary(userToken: string, templateType?: string): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/email_sequence/pool?template_type=${templateType}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return await processResponse(response, 'data');
}
