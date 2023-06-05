import React from "react";
import DemoFeedbackChart from "./DemoFeedbackChart";
import { Tabs } from "@mantine/core";
import {
  IconPhoto,
  IconMessageCircle,
  IconSettings,
  IconChartAreaFilled,
  IconChartArrows,
} from "@tabler/icons-react";
import { IconChartArcs } from "@tabler/icons";

export default function DemoFeedbackPage() {
  return (
    <div>
      <Tabs color="green" variant="pills" radius="xs" defaultValue="gallery">
        <Tabs.List>
          <Tabs.Tab
            value="cumulative-sdr"
            icon={<IconChartArcs size="0.8rem" />}
          >
            Cumulative SDR Demos
          </Tabs.Tab>
          <Tabs.Tab
            value="demo-satisfaction"
            icon={<IconChartAreaFilled size="0.8rem" />}
          >
            Demo Satisfaction
          </Tabs.Tab>
          <Tabs.Tab
            value="cumulative-company"
            icon={<IconChartArrows size="0.8rem" />}
          >
            Cumulative Company Demos
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="gallery" pt="xs">
          <DemoFeedbackChart />
        </Tabs.Panel>

        <Tabs.Panel value="messages" pt="xs">
          Messages tab content
        </Tabs.Panel>

        <Tabs.Panel value="settings" pt="xs">
          Settings tab content
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
