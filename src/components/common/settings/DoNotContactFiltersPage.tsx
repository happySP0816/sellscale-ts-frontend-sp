import { Alert, Paper, Tabs, rem, useMantineTheme } from "@mantine/core";
import { IconAlertCircle, IconBuilding } from "@tabler/icons";
import { IconLifebuoy } from "@tabler/icons-react";
import React from "react";
import DoNotContactListV2 from "./DoNotContactListV2";
import CRMContactFilter from "./CRMContactFilter/CRMContactFilter";

export default function DoNotContactFiltersPage() {
  const [selectedTab, setSelectedTab] = React.useState("company-dnc");

  return (
    <Paper>
      <Tabs
        value={selectedTab}
        onTabChange={(value: any) => setSelectedTab(value)}
        styles={(theme) => ({
          tab: {
            borderBottom: `2px solid transparent`,
            "&[data-active]": {
              borderBottom: `2px solid ${theme.colors.blue[theme.fn.primaryShade()]}`,
              color: theme.colors.blue[theme.fn.primaryShade()],
            },
            paddingTop: rem(16),
            paddingBottom: rem(16),

            color: theme.colors.gray[6],
          },
          panel: {
            marginTop: rem(16),
            width: "100%",
            paddingLeft: `${rem(0)} !important`,
          },
          tabLabel: {
            fontWeight: 600,
          },
          root: {
            width: "100%",
          },
        })}
      >
        <Tabs.List>
          <Tabs.Tab value="company-dnc" icon={<IconBuilding size="0.8rem" />}>
            Company-Wide Filter
          </Tabs.Tab>
          <Tabs.Tab value="sdr-dnc" icon={<IconLifebuoy size="0.8rem" />}>
            SDR Filter
          </Tabs.Tab>
          <Tabs.Tab value="crm-contact-filter" icon={<IconLifebuoy size="0.8rem" />}>
            CRM Contact Filter
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="sdr-dnc" pt="xs">
          {selectedTab === "sdr-dnc" && <DoNotContactListV2 forSDR />}
        </Tabs.Panel>

        <Tabs.Panel value="company-dnc" pt="xs">
          {selectedTab === "company-dnc" && <DoNotContactListV2 />}
        </Tabs.Panel>

        <Tabs.Panel value="crm-contact-filter" pt="xs">
          {selectedTab === "crm-contact-filter" && <CRMContactFilter />}
        </Tabs.Panel>
      </Tabs>
    </Paper>
  );
}
