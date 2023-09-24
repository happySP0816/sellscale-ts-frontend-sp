import { Tabs } from "@mantine/core";
import { PulseWrapper } from "./PulseWrapper";
import ICPFilters from "./ICPFilter/ICPFilters";

const PulseTabSelector = () => {
  return (
    <Tabs defaultValue="old_views">
      <Tabs.List>
        <Tabs.Tab value="old_views">Old Views</Tabs.Tab>
        <Tabs.Tab value="new_views">New Views</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="old_views">
        <PulseWrapper />
      </Tabs.Panel>
      <Tabs.Panel value="new_views">
        <ICPFilters />
      </Tabs.Panel>
    </Tabs>
  );
};

export default PulseTabSelector;
