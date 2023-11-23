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

  const [sideBarVisible, { toggle: toggleSideBar, open: openSideBar }] =
    useDisclosure(false);
  const [isTesting, setIsTesting] = useState(false);
  const [opened, { open, close, toggle }] = useDisclosure(false);
  const smScreenOrLess = useMediaQuery(
    `(max-width: ${SCREEN_SIZES.LG})`,
    false,
    { getInitialValueInEffect: true }
  );

  return (
    <Flex h={`calc(100vh)`}>
      <Box w={"100%"}>
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
