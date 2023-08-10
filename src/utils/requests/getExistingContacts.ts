import { logout } from "@auth/core";
import { showNotification } from "@mantine/notifications";
import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

export default async function getExistingContacts(userToken: string, limit: number, offset: number, search: string): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/prospect/existing_contacts?limit=${limit}&offset=${offset}&search=${search}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return await processResponse(response, 'data');
}
