import { ReactNode, useEffect, useState } from "react";
import {
  createStyles,
  Navbar,
  Group,
  Code,
  getStylesRef,
  rem,
  ScrollArea,
  Flex,
  Button,
  useMantineTheme,
  Box,
  Text,
  SelectItem,
  Tooltip,
  Stack,
  Divider,
  Center,
} from "@mantine/core";
import {
  IconSwitchHorizontal,
  IconLogout,
  IconHome,
  IconBrandLinkedin,
  IconMail,
  IconActivity,
  IconAddressBook,
  IconAffiliate,
  IconSearch,
  IconCheckbox,
  IconClipboardData,
  IconHistory,
  IconVocabulary,
  IconListDetails,
  IconMailFast,
  IconReport,
  IconUsers,
  IconSpeakerphone,
  IconSettings,
  IconAdjustments,
  IconCalendarEvent,
  IconFileDescription,
  IconWall,
  IconInbox,
  IconTools,
  IconFilter,
  IconFileLambda,
  IconTrash,
  IconFilterDollar,
  IconTargetArrow,
  IconChartHistogram,
  IconBell,
  IconSettings2,
  IconLifebuoy,
  IconMap,
  IconBooks,
} from "@tabler/icons-react";
import { LogoFull } from "@nav/old/Logo";
import { LinksGroup } from "./old/NavBarLinksGroup";
import { useRecoilState, useRecoilValue } from "recoil";
import { navTabState } from "@atoms/navAtoms";
import { animated, useSpring } from "@react-spring/web";
import { NAV_BAR_SIDE_WIDTH } from "@constants/data";
import ProfileIcon from "@nav/old/ProfileIcon";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { isLoggedIn, logout } from "@auth/core";
import { navigateToPage } from "@utils/documentChange";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getOnboardingCompletionReport } from "@utils/requests/getOnboardingCompletionReport";
import { hexToHexWithAlpha } from "@utils/general";
import getPersonas from "@utils/requests/getPersonas";
import { Archetype } from "src";
import { ProjectSelect } from "./old/ProjectSelect";
import {
  currentInboxCountState,
  currentProjectState,
} from "@atoms/personaAtoms";
import {
  IconAt,
  IconBrain,
  IconMessage,
  IconMilitaryRank,
  IconSeeding,
  IconTimelineEventPlus,
} from "@tabler/icons";
import PersonaCardMini from "@common/persona/PersonaCardMini";
import Logo from "./Logo";
import { useHover } from "@mantine/hooks";
import _ from "lodash";
import { openContextModal } from "@mantine/modals";

const useStyles = createStyles((theme) => ({
  navbar: {
    backgroundColor: theme.fn.variant({ variant: "filled", color: "dark" })
      .background,
  },

  header: {
    marginBottom: theme.spacing.md,
    borderTop: `${rem(1)} solid ${theme.fn.lighten(
      theme.fn.variant({ variant: "filled", color: "dark" }).background!,
      0.1
    )}`,
  },

  footer: {
    paddingTop: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderTop: `${rem(1)} solid ${theme.fn.lighten(
      theme.fn.variant({ variant: "filled", color: "dark" }).background!,
      0.1
    )}`,
  },

  link: {
    ...theme.fn.focusStyles(),
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    fontSize: theme.fontSizes.sm,
    color: theme.white,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.radius.sm,
    fontWeight: 500,

    "&:hover": {
      backgroundColor: theme.fn.lighten(
        theme.fn.variant({ variant: "filled", color: "dark" }).background!,
        0.1
      ),
    },
  },

  linkIcon: {
    ref: getStylesRef("icon"),
    color: theme.white,
    opacity: 0.75,
    marginRight: theme.spacing.sm,
  },
  linkActive: {
    "&, &:hover": {
      backgroundColor: theme.fn.lighten(
        theme.fn.variant({ variant: "filled", color: "dark" }).background!,
        0.15
      ),
      [`& .${getStylesRef("icon")}`]: {
        opacity: 0.9,
      },
      color: theme.white,
    },
  },

  setupLink: {
    ...theme.fn.focusStyles(),
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    fontSize: theme.fontSizes.sm,
    color: theme.white,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.radius.xl,
    fontWeight: 500,

    "&:hover": {
      backgroundColor: theme.colors.green[9],
    },
  },
  setupLinkActive: {
    "&, &:hover": {
      filter: "brightness(1.2)",
      [`& .${getStylesRef("icon")}`]: {
        opacity: 0.9,
      },
      color: theme.white,
    },
  },
}));

export default function SideNavbar(props: {}) {
  const { classes, cx } = useStyles();
  const userToken = useRecoilValue(userTokenState);
  const navigate = useNavigate();

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-sdr-onboarding-completion-report`],
    queryFn: async () => {
      const response = await getOnboardingCompletionReport(userToken);
      return response.status === "success" ? response.data : null;
    },
    enabled: isLoggedIn(),
  });

  // Get percentage from completed steps in report
  let stepsCount = 0;
  let completedStepsCount = 0;
  for (const key in data) {
    stepsCount += Object.keys(data[key]).length;
    completedStepsCount += Object.values(data[key])
      .flat()
      .filter((item: any) => item).length;
  }
  stepsCount -= 1; // TEMP: Remove the 4 coming soon steps that are always false
  const percentage = Math.round((completedStepsCount / stepsCount) * 100);

  return (
    <Group
      position="apart"
      sx={{
        flexDirection: "column",
      }}
      className={classes.navbar}
      w={NAV_BAR_SIDE_WIDTH}
    >
      <Stack w={"100%"} spacing={0}>
        <Logo />
        <Divider color="dark.4" />
        <Box m="md">
          <SideNavbarItem
            icon={<IconInbox size="1.0rem" />}
            label="Inbox"
            tabKey={["inbox", ""]}
          />
          <SideNavbarItem
            icon={<IconTargetArrow size="1.0rem" />}
            label="Campaigns"
            tabKey={["campaigns", "all/campaigns"]}
          />
          <SideNavbarItem
            icon={<IconUsers size="1.0rem" />}
            label="Contacts"
            tabKey={["contacts", "all/contacts"]}
          />
          <SideNavbarItem
            icon={<IconChartHistogram size="1.0rem" />}
            label="Analytics"
            tabKey={["analytics", "all/pipeline"]}
          />
        </Box>
      </Stack>
      <Stack w={"100%"} spacing={0}>
        <Box m="md">
          {percentage !== 100 && (
            <Button
              variant="gradient"
              gradient={{ from: "green.6", to: "green.9", deg: 90 }}
              compact
              fullWidth
              size="xs"
              leftIcon={<IconMap size="1.0rem" />}
              styles={{
                label: {
                  fontSize: 10,
                  fontWeight: 400,
                },
              }}
              h={25}
              onClick={() => {
                navigateToPage(navigate, "/onboarding");
              }}
            >
              Onboarding {percentage}%
            </Button>
          )}

          <Divider color="dark.4" mt="lg" mb="sm" />
          <SideNavbarItem
            icon={<IconBell size="1.0rem" />}
            label="Notifications"
            tabKey={["notifications", "all/recent-activity"]}
          />
          <SideNavbarItem
            icon={<IconSettings size="1.0rem" />}
            label="Settings"
            tabKey="settings"
          />
          <SideNavbarItem
            icon={<IconBooks size="1.0rem" />}
            label="Advanced"
            tabKey="advanced"
          />
        </Box>
        <Box>
          <Divider color="dark.4" />
          <ProfileCard />
        </Box>
      </Stack>
    </Group>
  );
}

function SideNavbarItem(props: {
  icon: ReactNode;
  label: string;
  tabKey: string | string[];
  onClick?: () => void;
}) {
  const navigate = useNavigate();
  const { hovered, ref } = useHover();

  const locParts = location.pathname?.split("/");
  const activeTab =
    locParts.length === 2 ? locParts[1] : `${locParts[1]}/${locParts[2]}`;

  const active =
    (Array.isArray(props.tabKey)
      ? props.tabKey.includes(activeTab)
      : activeTab === props.tabKey) || hovered;
  return (
    <Box
      ref={ref}
      sx={(theme) => ({
        borderRadius: theme.radius.sm,
        backgroundColor: active ? theme.colors.blue[3] + "20" : "transparent",
        cursor: "pointer",
      })}
      onClick={() => {
        props.onClick && props.onClick();
        navigateToPage(
          navigate,
          "/" + (Array.isArray(props.tabKey) ? props.tabKey[0] : props.tabKey)
        );
      }}
    >
      <Group spacing={7} px={10} py={7} noWrap>
        <Center
          h={20}
          w={20}
          sx={(theme) => ({
            color: active ? theme.colors.blue[4] : theme.colors.gray[4],
          })}
        >
          {props.icon}
        </Center>
        <Text
          fz={12}
          fw={active ? 500 : undefined}
          c={active ? "gray.0" : "dark.1"}
        >
          {props.label}
        </Text>
      </Group>
    </Box>
  );
}

function ProfileCard() {
  const userData = useRecoilValue(userDataState);
  const { hovered, ref } = useHover();

  return (
    <Group
      spacing={7}
      m="md"
      align="flex-start"
      noWrap
      ref={ref}
      sx={(theme) => ({
        cursor: "pointer",
        backgroundColor: hovered ? theme.colors.dark[4] : "transparent",
        borderRadius: theme.radius.sm,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
      })}
      onClick={() => {
        openContextModal({
          modal: "account",
          title: <></>,
          innerProps: {},
        });
      }}
    >
      <ProfileIcon />
      <Box>
        <Tooltip label={userData.sdr_name} openDelay={750} withArrow>
          <Text fw={500} fz={12} c="gray.0">
            {_.truncate(userData.sdr_name, { length: 12 })}
          </Text>
        </Tooltip>
        <Text fw={500} fz={8} c="dimmed">
          Manage Account
        </Text>
      </Box>
    </Group>
  );
}
