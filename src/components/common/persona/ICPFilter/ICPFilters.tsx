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
  const [opened, { open, close }] = useDisclosure(false);
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
            <Sidebar isTesting={isTesting} />
          </Box>
        </Drawer>
      ) : (
        <Sidebar isTesting={isTesting} />
      )}

      <Box
        w={
          smScreenOrLess ? "calc(100vw - 10rem)" : "calc(100vw - 10rem - 15rem)"
        }
      >
        <Box
          sx={(theme) => ({
            paddingLeft: theme.spacing.lg,
            paddingRight: theme.spacing.lg,
            paddingTop: theme.spacing.sm,
            width: "100%",
          })}
        >
          <Switch
            checked={isTesting}
            onChange={(event) => setIsTesting(event.currentTarget.checked)}
            label="(Test Mode) View sample of 50 prospects"
          />
        </Box>
        <ICPFiltersDashboard openFilter={open} />
      </Box>
    </Flex>
  );
};

export default ICPFilters;
