import { logout } from "@auth/core";
import { MantineTheme, Image } from "@mantine/core";
import { SpotlightAction } from "@mantine/spotlight";
import { NavigateFunction } from "react-router-dom";
import { navigateToPage } from "./documentChange";
import { valueToColor } from "./general";

/**
 * 
 * @param query 
 * @param navigate 
 * @returns - SplotlightActions, or null (= loading) or false (= failed to find).
 */
export async function activateQueryPipeline(query: string, navigate: NavigateFunction, theme: MantineTheme, userToken: string): Promise<SpotlightAction[] | null | false> {

  const prospects = await checkProspects(query, navigate, theme, userToken)
  const campaigns = await checkCampaigns(query, navigate, theme, userToken)

  // TODO: Add more checks here.
  return [...campaigns, ...prospects];

}

async function checkProspects(query: string, navigate: NavigateFunction, theme: MantineTheme, userToken: string){

  const response = await fetch(
    `${process.env.REACT_APP_API_URI}/prospect/get_prospects`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
      }),
    }
  );
  if(response.status === 401){ logout() }
  const res = await response.json();
  if (!res || !res.prospects) {
    return [];
  }

  return res.prospects.map((prospect: any) => {
    return {
      title: prospect.full_name,
      description: prospect.title,
      keywords: prospect.company,
      group: 'Prospects',
      onTrigger: () => navigateToPage(navigate, `/pipeline/${prospect.id}`),
      icon: (
        <Image
          src={`https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(
            prospect.full_name
          )}`}
          radius="lg"
          height={30}
          width={30}
        ></Image>
      ),
      badge: prospect.overall_status,
      badgeColor: valueToColor(theme, prospect.overall_status),
    };
  });

}


async function checkCampaigns(query: string, navigate: NavigateFunction, theme: MantineTheme, userToken: string){

  const response = await fetch(
    `${process.env.REACT_APP_API_URI}/campaigns/all_campaigns`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
      }),
    }
  );
  if(response.status === 401){ logout() }
  const res = await response.json();
  if (!res || !res.outbound_campaigns) {
    return [];
  }

  return res.outbound_campaigns.map((campaign: any) => {
    return {
      title: campaign.name,
      description: `Dates: ${new Date(campaign.campaign_start_date).toLocaleDateString("en-US")} - ${new Date(campaign.campaign_end_date).toLocaleDateString("en-US")} | ${campaign.prospect_ids.length} prospects`,
      keywords: '',
      group: 'Campaigns',
      onTrigger: () => navigateToPage(navigate, `/campaigns/${campaign.id}`),
      badge: campaign.status,
      badgeColor: valueToColor(theme, campaign.status),
    };
  });

}
