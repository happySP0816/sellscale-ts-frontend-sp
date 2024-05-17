import { Paper } from "@mantine/core";
import CampaignWizardAssetStep from "./CampaignWizardAssetStep";
import CampaignWizardSetupStep from "./CampaignWizardSetupStep";

export default function CampaignWizard() {
  return (
    <Paper p={"lg"}>
      <CampaignWizardAssetStep />
      <CampaignWizardSetupStep />
    </Paper>
  );
}
