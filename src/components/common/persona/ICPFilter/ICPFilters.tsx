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

const useStyles = createStyles(() => ({
  header: {
    // backgroundColor: theme.fn.variant({
    //   variant: "filled",
    //   color: theme.primaryColor,
    // }).background,
  },
}));

const ICPFilters = () => {
  return (
    <Flex h="100%" w={"100%"}>
      <ICPFiltersDashboard />
    </Flex>
  );
};

export default ICPFilters;
