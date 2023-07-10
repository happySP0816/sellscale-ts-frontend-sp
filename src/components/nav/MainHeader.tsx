import {
  createStyles,
  Header,
  Menu,
  Group,
  Center,
  Burger,
  Container,
  rem,
  Code,
  Box,
  Button,
  Text,
  Flex,
  getStylesRef,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronDown, IconFileDescription } from "@tabler/icons-react";
import { LogoFull } from "@nav/Logo";
import { version } from "../../../package.json";
import { ProjectSelect } from "./ProjectSelect";
import { SearchBar } from "./SearchBar";
import { navigateToPage } from "@utils/documentChange";
import { hexToHexWithAlpha } from "@utils/general";
import { useQuery } from "@tanstack/react-query";
import { getOnboardingCompletionReport } from "@utils/requests/getOnboardingCompletionReport";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { isLoggedIn } from "@auth/core";
import { useRecoilState, useRecoilValue } from "recoil";
import { useNavigate } from "react-router-dom";
import { navTabState } from "@atoms/navAtoms";
import { GlobalPageSelect } from "./GlobalPageSelect";
import ProfileIcon from "./ProfileIcon";
import { useEffect } from "react";
import { IconSettings } from '@tabler/icons';
import { currentProjectState } from '@atoms/personaAtoms';

const useStyles = createStyles((theme) => ({
  header: {
    backgroundColor: theme.fn.variant({ variant: "filled", color: "dark" })
      .background,
    borderBottom: 0,
  },

  inner: {
    height: rem(56),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  version: {
    backgroundColor: theme.fn.lighten(
      theme.fn.variant({ variant: "filled", color: "dark" }).background!,
      0.1
    ),
    color: theme.white,
    fontWeight: 700,
  },

  links: {
    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  linkIcon: {
    ref: getStylesRef("icon"),
    color: theme.white,
    opacity: 0.75,
    marginRight: theme.spacing.sm,
  },

  burger: {
    [theme.fn.largerThan("sm")]: {
      display: "none",
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

export const NAV_HEADER_HEIGHT = 56;

export function MainHeader() {
  const [opened, { toggle }] = useDisclosure(false);
  const { classes, theme, cx } = useStyles();
  const navigate = useNavigate();

  const userData = useRecoilValue(userDataState);
  const userToken = useRecoilValue(userTokenState);
  const [navTab, setNavTab] = useRecoilState(navTabState);
  const [currentProject, setCurrentProject] = useRecoilState(currentProjectState);

  // Update the navTab state when the URL changes
  const activeTab = location.pathname?.split("/")[1];
  const activeSubTab = location.pathname?.split("/")[2];

  useEffect(() => {
    // if (!fetchedPersonas) {
    //   setLoadingPersonas(true);
    //   getPersonas(userToken).then((j) => {
    //     setPersonaLinks(j.data);
    //     setLoadingPersonas(false);
    //   });
    //   setFetchedPersonas(true);
    // }

    let newTab = activeSubTab
      ? `${activeTab.trim()}-${activeSubTab.trim()}`
      : activeTab.trim();
    newTab = newTab === "" || newTab === "home" ? "inbox" : newTab;
    navigateToPage(
      navigate,
      `/${newTab.replace("-", "/")}`,
      new URLSearchParams(location.search)
    );

    setTimeout(() => setNavTab(newTab), 100);
  }, [activeTab, activeSubTab, setNavTab]);


  // Get Onboarding completion report
  // --------------------------------

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
  stepsCount -= 4; // TEMP: Remove the 4 coming soon steps that are always false

  const percentage = Math.round((completedStepsCount / stepsCount) * 100);
  // ------------------------------
  return (
    <Header height={NAV_HEADER_HEIGHT} className={classes.header} mb={120}>
      <Box mx={20}>
        <div className={classes.inner}>
          <Group position="apart" noWrap>
            <LogoFull size={28} />
            <Code className={classes.version}>v{version}</Code>

              <Box pl={60} pr={10} opacity={currentProject?.id ? '0' : ''}>
                <ProjectSelect />
              </Box>
            

            <SearchBar />
          </Group>

          <Group noWrap>
            {percentage !== 100 && (
              <Button
                size="md"
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
                    hexToHexWithAlpha(
                      theme.colors.green[9],
                      percentage / 100
                    ) || "",
                  deg: 90,
                }}
              >
                <IconFileDescription
                  className={classes.linkIcon}
                  stroke={1.5}
                />
                <span>Onboarding Setup - {percentage}%</span>
              </Button>
            )}

            <Box px={10}>
              <GlobalPageSelect />
            </Box>

            <Box mt="xs">
            <a
              href="#"
              onClick={(event) => {
              event.preventDefault();
              navigateToPage(navigate, "/settings");
              setTimeout(() => setNavTab("settings"), 100);
              setCurrentProject(null);
              }}
            >
              <IconSettings className={classes.linkIcon} stroke={1.5} />
            </a>
            </Box>

            <Box>
              <ProfileIcon />
            </Box>
          </Group>
        </div>
      </Box>
    </Header>
  );
}
