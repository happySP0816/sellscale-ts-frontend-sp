import { useState } from "react";
import { API_URL } from "@constants/data";

export type IcpRouteData = {
  title: string;
  description: string;
  filter_company: string;
  filter_title: string;
  filter_location: string;
  filter_company_size: string;
  segment_id?: number;
  send_slack?: boolean;
  id?: number;

  icpRouteId?: number;
  status?: boolean;
  routeTo?: string;
  icpRouteTitle?: string;
};

export type UpdateIcpRouteData = Partial<IcpRouteData> & {
  active?: boolean;
};

export const useTrackApi = (userToken: string) => {
  const [isLoading, setIsLoading] = useState(false);

  const getScript = async () => {
    setIsLoading(true);
    const url = new URL(`${API_URL}/track/get_script`);
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    });
    const data = await response.json();
    setIsLoading(false);
    return data;
  };

  const verifySource = async () => {
    setIsLoading(true);
    const url = new URL(`${API_URL}/track/verify_source`);
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    });
    const data = await response.text();
    setIsLoading(false);
    return data;
  };

  const getMostRecentTrackEvent = async () => {
    setIsLoading(true);
    const url = new URL(`${API_URL}/track/most_recent_track_event`);
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    });
    const data = await response.json();
    setIsLoading(false);
    return data;
  };

  const getTrackSourceMetadata = async () => {
    setIsLoading(true);
    const url = new URL(`${API_URL}/track/track_source_metadata`);
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    });
    const data = await response.json();
    setIsLoading(false);
    return data;
  };

  const getTrackEventHistory = async (dateRange: number) => {
    setIsLoading(true);
    const url = new URL(
      `${API_URL}/track/get_track_event_history?days=${dateRange}`
    );
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    });
    const data = await response.json();
    setIsLoading(false);
    return data;
  };

  const getDeanonomizedContacts = async (days: number = 14) => {
    setIsLoading(true);
    const url = new URL(
      `${API_URL}/track/get_deanonomized_contacts?days=${days}`
    );
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    });
    const data = await response.json();
    setIsLoading(false);
    return data.contacts;
  };

  const createIcpRoute = async (routeData: IcpRouteData) => {
    setIsLoading(true);
    const url = new URL(`${API_URL}/track/create_icp_route`);
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify(routeData),
    });
    const data = await response.json();
    setIsLoading(false);
    return data;
  };

  const updateIcpRoute = async (
    icpRouteId: number,
    routeData: UpdateIcpRouteData
  ) => {
    setIsLoading(true);
    const url = new URL(`${API_URL}/track/update_icp_route/${icpRouteId}`);
    const response = await fetch(url.toString(), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify(routeData),
    });
    const data = await response.json();
    setIsLoading(false);
    return data;
  };

  const getAllIcpRoutes = async () => {
    setIsLoading(true);
    const url = new URL(`${API_URL}/track/get_all_icp_routes`);
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    });
    const data = await response.json();
    setIsLoading(false);
    return data;
  };

  const getIcpRouteDetails = async (icpRouteId: number) => {
    setIsLoading(true);
    const url = new URL(`${API_URL}/track/get_icp_route_details/${icpRouteId}`);
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    });
    const data = await response.json();
    setIsLoading(false);
    return data;
  };

  const getSegments = async (
    includeAllInClient: boolean = true,
    tagFilter: boolean = false
  ) => {
    setIsLoading(true);
    const url = new URL(`${API_URL}/segment/all`);
    if (includeAllInClient) {
      url.searchParams.append("include_all_in_client", "true");
    }
    if (tagFilter) {
      url.searchParams.append("tag_filter", "true");
    }
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    });
    const data = await response.json();
    setIsLoading(false);
    return data.segments;
  };

  const autoClassifyDeanonymizedContacts = async (
    deanonymized_contact_ids: number[]
  ) => {
    setIsLoading(true);
    const url = new URL(`${API_URL}/track/auto_classify_deanonymized_contacts`);
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        deanonymized_contact_ids: deanonymized_contact_ids,
      }),
    });
    const data = await response.json();
    setIsLoading(false);
    return data;
  };

  return {
    isLoading,
    getTrackSourceMetadata,
    getScript,
    verifySource,
    getMostRecentTrackEvent,
    getTrackEventHistory,
    getDeanonomizedContacts,
    createIcpRoute,
    updateIcpRoute,
    getAllIcpRoutes,
    getIcpRouteDetails,
    getSegments,
    autoClassifyDeanonymizedContacts,
  };
};
