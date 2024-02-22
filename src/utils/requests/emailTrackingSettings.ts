
import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Modifies campaign level email tracking settings
 * @param userToken
 * @param campaignID
 * @param openTracking
 * @param clickTracking
 * @returns - MsgResponse
 */
export async function postEmailTrackingSettings(userToken: string, campaignID: number, openTracking: boolean | null, clickTracking: boolean | null): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/smartlead/campaign/settings/tracking`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        campaign_id: campaignID,
        track_open: openTracking,
        track_link: clickTracking,
      })
    }
  );
  return await processResponse(response, 'data');

}


/**
 * Modifies SDR level email tracking settings
 * @param userToken
 * @param openTracking
 * @param clickTracking
 * @returns - MsgResponse
 */
export async function postSDREmailTrackingSettings(userToken: string, openTracking: boolean | null, clickTracking: boolean | null): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/sdr/email/tracking`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        track_open: openTracking,
        track_link: clickTracking,
      })
    }
  );
  return await processResponse(response, 'data');

}