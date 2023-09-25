import { Tabs } from "@mantine/core";
import { PulseWrapper } from "./PulseWrapper";
import ICPFilters from "./ICPFilter/ICPFilters";

const PulseTabSelector = () => {
  return (
    <Tabs defaultValue="old_view">
      <Tabs.List>
        <Tabs.Tab value="old_view">Old View</Tabs.Tab>
        <Tabs.Tab value="new_view">New View</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="old_view">
        <PulseWrapper />
      </Tabs.Panel>
      <Tabs.Panel value="new_view">
        <ICPFilters />
      </Tabs.Panel>
    </Tabs>
  );
};

export default PulseTabSelector;
