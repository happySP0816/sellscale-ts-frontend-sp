import { Container, useMantineTheme } from "@mantine/core";
import { IconUserPlus } from "@tabler/icons";
import { useMediaQuery } from "@mantine/hooks";
import { SCREEN_SIZES } from "../../constants/data";
import PipelineSelector, { icons } from "../common/pipeline/PipelineSelector";
import ProspectTable from "../common/pipeline/ProspectTable";
import PageFrame from "@common/PageFrame";
import CampaignTable from "@common/campaigns/CampaignTable";

export default function CampaignsPage() {

  return (
    <PageFrame>
      <CampaignTable />
    </PageFrame>
  );
}
