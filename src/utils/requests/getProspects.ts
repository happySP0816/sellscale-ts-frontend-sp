import { API_URL } from "@constants/data";
import { MsgResponse, Prospect } from "src";
import { processResponse } from "./utils";
import _ from "lodash";
import { isWithinLastXDays } from "@utils/general";
import { prospectStatuses } from "@common/inbox/utils";

export async function getProspects(userToken: string,
  query?: string,
  channel?: string,
  limit?: number,
  status?: string[],
  show_purgatory?: boolean | 'ALL',
): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/prospect/get_prospects`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        channel: channel,
        limit: limit,
        status: status,
        show_purgatory: show_purgatory,
      }),
    }
  );

  const result = await processResponse(response, 'prospects');
  //const prospects = result.status === 'success' ? result.data as Prospect[] : [];

  return result;

}


export function populateInboxNotifs(prospects: Prospect[]){

  let recommendedProspects = _.cloneDeep(prospects);
  recommendedProspects = recommendedProspects.filter((p) => p.overall_status === 'ACTIVE_CONVO');
  recommendedProspects = recommendedProspects.filter((p) => !p.li_is_last_message_from_sdr || isWithinLastXDays(new Date(p.li_last_message_timestamp), 3));
  recommendedProspects = recommendedProspects.filter((p) => {
    return prospectStatuses.find((option) => option.value === p.linkedin_status);
  });

  const inboxNotifs = new Map<string, number>();
  for (const prospect of recommendedProspects) {
    const count = inboxNotifs.get(prospect.archetype_id+'');
    if (count === undefined) {
      inboxNotifs.set(prospect.archetype_id+'', 1);
    } else {
      inboxNotifs.set(prospect.archetype_id+'', count + 1);
    }
  }

  const obj: Record<string, number> = {};
  for (const [projectId, count] of inboxNotifs.entries()) {
    obj[projectId] = count;
  }
  localStorage.setItem('inboxNotifs', JSON.stringify(obj));

  return recommendedProspects.length;
}

/**
 * Get inbox notifications
 * @returns - Map of project id to number of inbox notifications
 */
export function getInboxNotifs(): Record<string, number>{

  const inboxNotifs = localStorage.getItem('inboxNotifs');
  if (inboxNotifs === null) {
    return {};
  }
  return JSON.parse(inboxNotifs);

}
