import {
  Box,
  Button,
  Drawer,
  Flex,
  ScrollArea,
  Switch,
  createStyles,
} from "@mantine/core";
import ICPFiltersDashboard from "./ICPFiltersDashboard";
import Sidebar from "./Sidebar";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { SCREEN_SIZES } from "@constants/data";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

const useStyles = createStyles((theme) => ({
  header: {
    // backgroundColor: theme.fn.variant({
    //   variant: "filled",
    //   color: theme.primaryColor,
    // }).background,
  },
}));

const ICPFilters = () => {
  const { classes, theme, cx } = useStyles();

  const queryClient = useQueryClient();

  const [opened, { open, close, toggle }] = useDisclosure(false);
  const [sideBarVisible, { toggle: toggleSideBar, open: openSideBar }] =
    useDisclosure(true);
  const [isTesting, setIsTesting] = useState(false);
  const smScreenOrLess = useMediaQuery(
    `(max-width: ${SCREEN_SIZES.LG})`,
    false,
    { getInitialValueInEffect: true }
  );

  return (
    <Flex h={`calc(100vh - 2.25rem)`}>
      {smScreenOrLess ? (
        <Drawer
          opened={opened}
          onClose={close}
          withCloseButton={false}
          size={"15rem"}
          overlayProps={{ blur: 4 }}
        >
          <Box h={"100vh"} pos={"relative"} m={"-1rem"}>
            <Sidebar
              isTesting={isTesting}
              sideBarVisible={sideBarVisible}
              toggleSideBar={() => {
                toggleSideBar();
                toggle();
              }}
              setIsTesting={setIsTesting}
            />
          </Box>
        </Drawer>
      ) : (
        <Sidebar
          isTesting={isTesting}
          sideBarVisible={sideBarVisible}
          toggleSideBar={toggleSideBar}
          setIsTesting={setIsTesting}
        />
      )}

      <Box
        w={
          smScreenOrLess ? "calc(100vw - 10rem)" : "calc(100vw - 10rem - 15rem)"
        }
      >
        <ICPFiltersDashboard
          isTesting={isTesting}
          openFilter={() => {
            openSideBar();
            open();
          }}
        />
      </Box>
    </Flex>
  );
};

export default ICPFilters;
