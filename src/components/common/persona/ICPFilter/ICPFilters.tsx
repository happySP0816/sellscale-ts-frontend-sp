import {
  Box,
  Button,
  Drawer,
  Flex,
  ScrollArea,
  createStyles,
} from "@mantine/core";
import ICPFiltersDashboard from "./ICPFiltersDashboard";
import Sidebar from "./Sidebar";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { SCREEN_SIZES } from "@constants/data";

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

  const smScreenOrLess = useMediaQuery(
    `(max-width: ${SCREEN_SIZES.LG})`,
    false,
    { getInitialValueInEffect: true }
  );

  return (
    <Flex>
      {smScreenOrLess ? (
        <Drawer
          opened={opened}
          onClose={close}
          withCloseButton={false}
          size={"15rem"}
          overlayProps={{ blur: 4 }}
        >
          <Box h={"100vh"} pos={"relative"} m={"-1rem"}>
            <Sidebar />
          </Box>
        </Drawer>
      ) : (
        <Sidebar />
      )}

      <Box
        w={
          smScreenOrLess ? "calc(100vw - 10rem)" : "calc(100vw - 10rem - 15rem)"
        }
      >
        <ICPFiltersDashboard openFilter={open} />
      </Box>
    </Flex>
  );
};

export default ICPFilters;
