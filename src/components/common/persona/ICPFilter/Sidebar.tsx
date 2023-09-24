import { Flex, ScrollArea, Box } from "@mantine/core";
import Filters from "./Filters";
import { SidebarFooter } from "./SidebarFooter";
import { SidebarHeader } from "./SidebarHeader";

const Sidebar = () => {
  return (
    <Flex direction={"column"} h={"100vh"} w={"15rem"}>
      <SidebarHeader />

      <ScrollArea>
        <Box p="md">
          <Filters />
        </Box>
      </ScrollArea>

      <SidebarFooter />
    </Flex>
  );
};

export default Sidebar;
