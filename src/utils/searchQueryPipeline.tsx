import { logout } from "@auth/core";
import { MantineTheme, Image } from "@mantine/core";
import { SpotlightAction } from "@mantine/spotlight";
import { NavigateFunction } from "react-router-dom";
import { valueToColor } from "./general";

/**
 * 
 * @param query 
 * @param navigate 
 * @returns - SplotlightActions, or null (= loading) or false (= failed to find).
 */
export async function activateQueryPipeline(query: string, navigate: NavigateFunction, theme: MantineTheme, userToken: string): Promise<SpotlightAction[] | null | false> {

  let prospects = await checkProspects(query, navigate, theme, userToken)

  // TODO: Add more checks here.
  return [...prospects];

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
      keywords: prospect.industry+' '+prospect.company,
      group: 'Prospects',
      onTrigger: () => navigate(`/pipeline/${prospect.id}`),
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
      badge: prospect.status,
      badgeColor: valueToColor(theme, prospect.status),
    };
  });

}
