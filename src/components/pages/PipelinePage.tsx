import { Container, useMantineTheme } from "@mantine/core";
import { IconUserPlus } from "@tabler/icons";
import { useMediaQuery } from "@mantine/hooks";
import { SCREEN_SIZES } from "../../constants/data";
import PipelineSelector, { icons } from "../common/pipeline/PipelineSelector";
import ProspectTable from "../common/pipeline/ProspectTable";
import PageFrame from "@common/PageFrame";
import { useQuery } from "react-query";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";

function getPipelineSelectorData(data: any){
  return new Map()
  .set('all', {
    title: "All Prospects",
    description: "All prospects in the pipeline",
    icon: IconUserPlus,
    value: data?.pipeline_data?.sent_outreach || "-",
    color: "blue",
  })
  .set('accepted', {
    title: "Accepted",
    description: "Accepted prospects in the pipeline",
    icon: IconUserPlus,
    value: data?.pipeline_data?.accepted || "-",
    color: "green",
  })
  .set('bumped', {
    title: "Bumped",
    description: "Bumped prospects in the pipeline",
    icon: IconUserPlus,
    value: data?.pipeline_data?.responded || "-",
    color: "orange",
  })
  .set('active', {
    title: "Active Convos",
    description: "Active conversations in the pipeline",
    icon: IconUserPlus,
    value: (data?.pipeline_data) ? (data.pipeline_data.active_convo + data.pipeline_data.scheduling) : "-",
    color: "yellow",
  })
  .set('demo', {
    title: "Demo Set",
    description: "Demo set prospects in the pipeline",
    icon: IconUserPlus,
    value: (data?.pipeline_data) ? (data.pipeline_data.demo_loss + data.pipeline_data.demo_set + data.pipeline_data.demo_won) : "-",
    color: "purple",
  });
}

export default function PipelinePage() {
  const theme = useMantineTheme();
  const smScreenOrLess = useMediaQuery(`(max-width: ${SCREEN_SIZES.SM})`);
  const userToken = useRecoilValue(userTokenState);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-pipeline-details`],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.REACT_APP_API_URI}/analytics/pipeline/all_details`,
        {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${userToken}`,
          },
        }
      );
      const res = await response.json();

      return res;
    },
  });

  const PIPELINE_SELECTOR_DATA = getPipelineSelectorData(data);
  return (
    <PageFrame>
      <PipelineSelector data={PIPELINE_SELECTOR_DATA} />
      <Container pt={30} px={0}>
        <ProspectTable selectorData={PIPELINE_SELECTOR_DATA} />
      </Container>
    </PageFrame>
  );
}
