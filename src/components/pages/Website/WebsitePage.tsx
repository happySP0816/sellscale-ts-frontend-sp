import { Box, Tabs, Title } from "@mantine/core";
import WebsiteOverview from "./WebsiteOverview";

export default function WebsitePage() {
  return (
    <Box px={60} py={"xl"}>
      <Title order={2}>Website</Title>
      <Tabs defaultValue="overview">
        <Tabs.List>
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">
          <WebsiteOverview />
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
}
