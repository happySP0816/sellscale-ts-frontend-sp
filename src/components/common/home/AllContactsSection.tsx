import { Container, useMantineTheme } from "@mantine/core";
import { IconUserPlus } from "@tabler/icons";
import { useMediaQuery } from "@mantine/hooks";
import { API_URL, SCREEN_SIZES } from "@constants/data";
import PipelineSelector, { icons } from "../pipeline/PipelineSelector";
import ProspectTable_old from "../pipeline/ProspectTable_old";
import PageFrame from "@common/PageFrame";
import { useQuery } from "@tanstack/react-query";
import { useRecoilState, useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { logout } from "@auth/core";
import { useLoaderData } from "react-router-dom";
import {
  prospectDrawerIdState,
  prospectDrawerOpenState,
  prospectShowPurgatoryState,
} from "@atoms/prospectAtoms";
import { useEffect, useState } from "react";

function getPipelineSelectorData(data: any) {
  return new Map()
    .set("all", {
      title: "All Prospects",
      description: "All prospects in the pipeline",
      icon: IconUserPlus,
      value: data?.pipeline_data?.SELLSCALE.SENT_OUTREACH || "-",
      color: "blue",
    })
    .set("accepted", {
      title: "Accepted",
      description: "Accepted prospects in the pipeline",
      icon: IconUserPlus,
      value: data?.pipeline_data?.SELLSCALE.ACCEPTED || "-",
      color: "green",
    })
    .set("bumped", {
      title: "Bumped",
      description: "Bumped prospects in the pipeline",
      icon: IconUserPlus,
      value: data?.pipeline_data?.SELLSCALE.BUMPED || "-",
      color: "orange",
    })
    .set("active", {
      title: "Active Convos",
      description: "Active conversations in the pipeline",
      icon: IconUserPlus,
      value: data?.pipeline_data?.SELLSCALE.ACTIVE_CONVO || "-",
      color: "yellow",
    })
    .set("demo", {
      title: "Demo Set",
      description: "Demo set prospects in the pipeline",
      icon: IconUserPlus,
      value: data?.pipeline_data?.SELLSCALE.DEMO || "-",
      color: "grape",
    });
}

export default function AllContactsSection() {
  //const { prospectId } = useLoaderData() as { prospectId: string };
  const [_opened, setOpened] = useRecoilState(prospectDrawerOpenState);
  const [_prospectId, setProspectId] = useRecoilState(prospectDrawerIdState);
  /*
  useEffect(() => {
    if(prospectId && prospectId.trim().length > 0){
      setProspectId(+prospectId.trim())
      setOpened(true);
    }
  }, [prospectId]);
  */

  const userToken = useRecoilValue(userTokenState);
  const showPurgatory = useRecoilValue(prospectShowPurgatoryState);
  const [loadingData, setLoadingData] = useState(false);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-pipeline-details`, { showPurgatory }],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { showPurgatory }] = queryKey;

      setLoadingData(true);
      const response = await fetch(
        `${API_URL}/analytics/pipeline/all_details?include_purgatory=${showPurgatory}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      if (response.status === 401) {
        logout();
      }
      const res = await response.json();

      setLoadingData(false);

      return res;
    },
  });

  const PIPELINE_SELECTOR_DATA = getPipelineSelectorData(data);
  return (
    <div>
      <PipelineSelector
        data={PIPELINE_SELECTOR_DATA}
        loadingData={loadingData}
      />
      <Container pt={15} px={0}>
        <ProspectTable_old />
      </Container>
    </div>
  );
}
