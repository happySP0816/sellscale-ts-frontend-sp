import {
  List,
  ThemeIcon,
  Text,
  Container,
  Stack,
  Flex,
  Title,
  useMantineTheme,
} from "@mantine/core";
import {
  IconUserPlus,
  IconDiscount2,
  IconReceipt2,
  IconCoin,
  IconArrowUpRight,
  IconArrowDownRight,
} from "@tabler/icons";
import { useMediaQuery } from "@mantine/hooks";
import { IconInfoSquareRounded } from "@tabler/icons";
import { SCREEN_SIZES } from "../../constants/data";
import PageFrame from "../common/PageFrame";
import PipelineSelector, { icons } from "../common/pipeline/PipelineSelector";
import ProspectTable from "../common/pipeline/ProspectTable";

const PIPELINE_SELECTOR_DATA = [
  {
    title: "All Prospects",
    description: "All prospects in the pipeline",
    icon: IconUserPlus,
    value: "1,829",
    color: "blue",
  },
  {
    title: "Accepted",
    description: "Accepted prospects in the pipeline",
    icon: IconUserPlus,
    value: "329",
    color: "green",
  },
  {
    title: "Bumped",
    description: "Bumped prospects in the pipeline",
    icon: IconUserPlus,
    value: "184",
    color: "orange",
  },
  {
    title: "Active Convos",
    description: "Active conversations in the pipeline",
    icon: IconUserPlus,
    value: "92",
    color: "yellow",
  },
  {
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

  return (
    <PageFrame>
      <PipelineSelector data={PIPELINE_SELECTOR_DATA}></PipelineSelector>
      <Container pt={30} px={0}>
        <ProspectTable />
      </Container>
    </PageFrame>
  );
}
