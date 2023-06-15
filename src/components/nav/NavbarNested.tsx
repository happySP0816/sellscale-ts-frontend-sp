import { useEffect, useState } from "react";
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
  SelectItem,
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
} from "@tabler/icons-react";
import { LogoFull } from "@nav/Logo";
import { LinksGroup } from "./NavBarLinksGroup";
import { version } from "../../../package.json";
import { useRecoilState, useRecoilValue } from "recoil";
import { navTabState } from "@atoms/navAtoms";
import { animated, useSpring } from "@react-spring/web";
import { NAV_BAR_SIDE_WIDTH } from "@constants/data";
import { ProfileCard } from "@nav/ProfileIcon";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { isLoggedIn, logout } from "@auth/core";
import { navigateToPage } from "@utils/documentChange";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getOnboardingCompletionReport } from "@utils/requests/getOnboardingCompletionReport";
import { hexToHexWithAlpha } from "@utils/general";
import getPersonas from "@utils/requests/getPersonas";
import { Archetype } from 'src';

const useStyles = createStyles((theme) => ({
  navbar: {
    backgroundColor: theme.fn.variant({ variant: "filled", color: "dark" })
      .background,
  },

  version: {
    backgroundColor: theme.fn.lighten(
      theme.fn.variant({ variant: "filled", color: "dark" }).background!,
      0.1
    ),
    color: theme.white,
    fontWeight: 700,
  },

  header: {
    paddingBottom: theme.spacing.md,
    marginBottom: `calc(${theme.spacing.md} * 1.5)`,
    marginLeft: theme.spacing.md,
    marginRight: theme.spacing.md,
    borderBottom: `${rem(1)} solid ${theme.fn.lighten(
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

const AnimatedNavbar = animated(Navbar);

export function NavbarNested(props: {
  isMobileView: boolean;
  navOpened: boolean;
}) {
  const { classes, cx } = useStyles();
  const navigate = useNavigate();
  const theme = useMantineTheme();

  const loggedIn = isLoggedIn();

  const userData = useRecoilValue(userDataState);
  const userToken = useRecoilValue(userTokenState);
  const [navTab, setNavTab] = useRecoilState(navTabState);

  const activeTab = location.pathname?.split("/")[1];
  const activeSubTab = location.pathname?.split("/")[2];

  const [loadingPersonas, setLoadingPersonas] = useState(false);
  const [personaLinks, setPersonaLinks]: any = useState([]);

  const navStyles = useSpring({
    x: props.isMobileView && !props.navOpened ? -NAV_BAR_SIDE_WIDTH * 2 : 0,
  });

   useQuery({
      queryKey: [`query-personas-data-sidebar`],
      queryFn: async () => {
        if (!loggedIn) {
          setLoadingPersonas(false);
          return [];
        }
        setLoadingPersonas(true);
        const response = await getPersonas(userToken);
        const result =
          response.status === "success" ? (response.data as Archetype[]) : [];

        const mapped_result = result.map((res) => {
          return {
            value: res.id + "",
            label: res.archetype,
            archetype: res.archetype,
            id: res.id,
            active: res.active,
          };
        });
        setPersonaLinks(mapped_result);
        setLoadingPersonas(false);
        return mapped_result satisfies SelectItem[];
      },
      refetchOnWindowFocus: false,
    });




  // Update the navTab state when the URL changes
  useEffect(() => {
    // if (!fetchedPersonas) {
    //   setLoadingPersonas(true);
    //   getPersonas(userToken).then((j) => {
    //     console.log("GOT HERE BOI");
    //     console.log(j.data);
    //     setPersonaLinks(j.data);
    //     setLoadingPersonas(false);
    //   });
    //   setFetchedPersonas(true);
    // }
   
    let newTab = activeSubTab
      ? `${activeTab.trim()}-${activeSubTab.trim()}`
      : activeTab.trim();
    newTab = newTab === "" || newTab === "home" ? "dashboard" : newTab;
    navigateToPage(
      navigate,
      `/${newTab.replace("-", "/")}`,
      new URLSearchParams(location.search)
    );

    setTimeout(() => setNavTab(newTab), 100);
  }, [activeTab, activeSubTab, setNavTab]);

  const siteLinks = [
    {
      mainKey: "search",
      label: "Search",
      icon: IconSearch,
      links: [{ key: "search", label: "Search", icon: IconSearch, link: "/" }],
    },
    {
      mainKey: "dashboard",
      label: "Dashboard",
      icon: IconCheckbox,
      links: [
        {
          key: "dashboard",
          label: "Dashboard",
          icon: IconCheckbox,
          link: "/dashboard",
        },
      ],
    },
    {
      mainKey: "home",
      label: "Home",
      icon: IconHome,
      links: [
        {
          key: "home-all-contacts",
          label: "Pipeline",
          icon: IconAddressBook,
          link: "/home/all-contacts",
        },
        {
          key: "home-recent-activity",
          label: "Recent Activity",
          icon: IconActivity,
          link: "/home/recent-activity",
        },
        {
          key: "home-demo-feedback",
          label: "Demo Feedback Repo",
          icon: IconClipboardData,
          link: "/home/demo-feedback",
        },
        {
          key: "home-calendar",
          label: "Demo Calendar",
          icon: IconCalendarEvent,
          link: "/home/calendar",
        },
      ],
    },
    {
      mainKey: "linkedin",
      label: "LinkedIn",
      icon: IconBrandLinkedin,
      links: [
        {
          key: "linkedin-messages",
          label: "Scheduled Messages",
          icon: IconMailFast,
          link: "/linkedin/messages",
        },
        // {
        //   key: "linkedin-ctas",
        //   label: "CTAs",
        //   icon: IconSpeakerphone,
        //   link: "/linkedin/ctas",
        // },
        {
          key: "linkedin-bump-frameworks",
          label: "Bump Frameworks",
          icon: IconAdjustments,
          link: "/linkedin/bump-frameworks",
        },
        {
          key: "linkedin-campaign-analytics",
          label: "Campaign Analytics",
          icon: IconReport,
          link: "/linkedin/campaign-analytics",
        },
        {
          key: "linkedin-voices",
          label: "Voices",
          icon: IconVocabulary,
          link: "/linkedin/voices",
        },
      ],
    },
    {
      mainKey: "email",
      label: "Email",
      icon: IconMail,
      links: [
        {
          key: "email-scheduled-emails",
          label: "Scheduled Emails",
          icon: IconMailFast,
          link: "/email/scheduled-emails",
        },
        // { // TODO(Aakash): hidden for now. may require code removal.
        //   key: 'email-sequences',
        //   label: 'Sequences',
        //   icon: IconListDetails,
        //   link: '/email/sequences',
        // },
        // {
        //   key: "email-blocks",
        //   label: "Email Blocks",
        //   icon: IconWall,
        //   link: "/email/blocks",
        // },
        /*       {
              key: "email-personalizations",
              label: "Personalizations",
              icon: IconAffiliate,
              link: "/email/personalizations",
            }, */
        {
          key: "email-campaign-analytics",
          label: "Campaign Analytics",
          icon: IconReport,
          link: "/email/campaign-analytics",
        },
        // { key: 'email-email-details', label: 'Sequence Analysis', icon: IconReport, link: '/email/email-details' },
      ],
    },
    {
      mainKey: "personas",
      label: "Personas" + (loadingPersonas ? " ..." : ""),
      icon: IconUsers,
      links: [
        {
          key: "personas",
          label: "All Personas",
          icon: IconUsers,
          link: "/personas",
        },
      ].concat(
        personaLinks.map(
          (x: { archetype: string; id: number; active: boolean }) => {
            return {
              key: "persona-" + x.id,
              label: x.archetype,
              icon: () => (
                <Box mr="xs">
                  <IconUsers size="0.9rem" color={x.active ? "green" : "red"} />
                </Box>
              ),
              link: `/personas/${x.id}`,
            };
          }
        )
      ),
    },
  ];

  const links = siteLinks.map((item) => (
    <LinksGroup {...item} key={item.mainKey} />
  ));

  // Get Onboarding completion report
  // --------------------------------

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-sdr-onboarding-completion-report`],
    queryFn: async () => {
      var response;
      if (loggedIn) {
        response = await getOnboardingCompletionReport(userToken);
      } else {
        response = {};
      }
      return response.status === "success" ? response.data : null;
    },
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
  stepsCount -= 4; // TEMP: Remove the 4 coming soon steps that are always false

  const percentage = Math.round((completedStepsCount / stepsCount) * 100);
  // ------------------------------

  return (
    <AnimatedNavbar
      style={{
        display: loggedIn ? "flex" : "none",
        justifyContent: "space-between",
        transform: navStyles.x.to((x) => `translate3d(${x}%,0,0)`),
      }}
      width={{ base: NAV_BAR_SIDE_WIDTH }}
      p="md"
      className={classes.navbar}
    >
      <Navbar.Section className={classes.header}>
        <Group position="apart">
          <LogoFull size={28} />
          <Code className={classes.version}>v{version}</Code>
        </Group>
      </Navbar.Section>

      {true && (
        <Flex w="100%" mb="md">
          <Button
            w="100%"
            size="lg"
            className={cx(classes.setupLink, {
              [classes.setupLinkActive]: "setup" === navTab,
            })}
            onClick={(event) => {
              event.preventDefault();
              navigateToPage(navigate, "/setup");
              setTimeout(() => setNavTab("setup"), 100);
            }}
            variant="gradient"
            gradient={{
              from: theme.colors.green[9],
              to:
                hexToHexWithAlpha(theme.colors.green[9], percentage / 100) ||
                "",
              deg: 90,
            }}
          >
            <IconFileDescription className={classes.linkIcon} stroke={1.5} />
            <span>Onboarding Setup - {percentage}%</span>
          </Button>
        </Flex>
      )}

      <Navbar.Section grow component={ScrollArea}>
        <div>{links}</div>
      </Navbar.Section>

      <Navbar.Section className={classes.footer}>
        <ProfileCard />

        <a
          href="#"
          className={cx(classes.link, {
            [classes.linkActive]:
              "settings" === navTab || navTab.startsWith("settings-"),
          })}
          onClick={(event) => {
            event.preventDefault();
            navigateToPage(navigate, "/settings");
            setTimeout(() => setNavTab("settings"), 100);
          }}
        >
          <IconSettings className={classes.linkIcon} stroke={1.5} />
          <span>Settings</span>
        </a>

        <a
          href="#"
          className={classes.link}
          onClick={(event) => {
            event.preventDefault();
            logout(true);
          }}
        >
          <IconLogout className={classes.linkIcon} stroke={1.5} />
          <span>Logout</span>
        </a>
      </Navbar.Section>
    </AnimatedNavbar>
  );
}
