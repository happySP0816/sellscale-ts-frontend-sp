import { Flex, ScrollArea, Box } from "@mantine/core";
import Filters from "./Filters";
import { SidebarFooter } from "./SidebarFooter";
import { SidebarHeader } from "./SidebarHeader";

const Sidebar = () => {
  return (
    <Flex direction={"column"} mah={"100vh"} w={"15rem"}>
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
