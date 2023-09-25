import { Flex, ScrollArea, Box } from "@mantine/core";
import Filters from "./Filters";
import { SidebarFooter } from "./SidebarFooter";
import { SidebarHeader } from "./SidebarHeader";
import { FC } from "react";

const Sidebar: FC<{ isTesting: boolean }> = ({ isTesting }) => {
  return (
    <Flex direction={"column"} h={"100%"} w={"15rem"}>
      <SidebarHeader />

      <ScrollArea>
        <Filters isTesting={isTesting} />
      </ScrollArea>

      <SidebarFooter isTesting={isTesting} />
    </Flex>
  );
};

export default Sidebar;
