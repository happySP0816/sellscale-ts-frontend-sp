import { Flex, ScrollArea, Box } from "@mantine/core";
import Filters from "./Filters";
import { SidebarFooter } from "./SidebarFooter";
import { SidebarHeader } from "./SidebarHeader";
import { FC } from "react";

const Sidebar: FC<{
  isTesting: boolean;
  sideBarVisible: boolean;
  toggleSideBar: () => void;
  setIsTesting: (val: boolean) => void;
}> = ({ isTesting, sideBarVisible, toggleSideBar, setIsTesting }) => {
  return (
    <Flex
      direction={"column"}
      h={"100%"}
      w={sideBarVisible ? "15rem" : "4rem"}
      style={{
        transition: "width",
        transitionDuration: "150ms",
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <SidebarHeader
        sideBarVisible={sideBarVisible}
        toggleSideBar={toggleSideBar}
        isTesting={isTesting}
        setIsTesting={setIsTesting}
      />

      {sideBarVisible && (
        <>
          <ScrollArea px={"md"}>
            <Filters isTesting={isTesting} selectOptions={[]} />
          </ScrollArea>
        </>
      )}
    </Flex>
  );
};

export default Sidebar;
