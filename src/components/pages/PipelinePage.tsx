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

const PIPELINE_SELECTOR_DATA = [
  {
    id: "all",
    title: "All Prospects",
    description: "All prospects in the pipeline",
    icon: IconUserPlus,
    value: "1,829",
    color: "blue",
  },
  {
    id: "accepted",
    title: "Accepted",
    description: "Accepted prospects in the pipeline",
    icon: IconUserPlus,
    value: "329",
    color: "green",
  },
  {
    id: "bumped",
    title: "Bumped",
    description: "Bumped prospects in the pipeline",
    icon: IconUserPlus,
    value: "184",
    color: "orange",
  },
  {
    id: "active",
    title: "Active Convos",
    description: "Active conversations in the pipeline",
    icon: IconUserPlus,
    value: "92",
    color: "yellow",
  },
  {
    id: "demo",
    title: "Demo Set",
    description: "Demo set prospects in the pipeline",
    icon: IconUserPlus,
    value: "48",
    color: "purple",
  },
];

export default function PipelinePage() {
  const theme = useMantineTheme();
  const smScreenOrLess = useMediaQuery(`(max-width: ${SCREEN_SIZES.SM})`);
  const userToken = useRecoilValue(userTokenState);

  const { data, isFetching, refetch } = useQuery({
    queryFn: async () => {
      const response = await fetch(
        `${process.env.REACT_APP_API_URI}/prospect/get_prospects?client_sdr_id=20`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      const res = await response.json();

      console.log(res);

      return "";
    },
  });

  return (
    <PageFrame>
      <PipelineSelector data={PIPELINE_SELECTOR_DATA}></PipelineSelector>
      <Container pt={30} px={0}>
        <ProspectTable />
      </Container>
    </PageFrame>
  );
}
