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
  Text,
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
  IconInbox,
  IconTools,
  IconFilter,
  IconFileLambda,
  IconTrash,
} from "@tabler/icons-react";
import { LogoFull } from "@nav/Logo";
import { LinksGroup } from "./NavBarLinksGroup";
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
import { Archetype } from "src";
import { ProjectSelect } from './ProjectSelect';
import { currentInboxCountState, currentProjectState } from '@atoms/personaAtoms';
import { IconAt, IconBrain, IconMessage, IconMilitaryRank, IconTimelineEventPlus } from '@tabler/icons';
import PersonaCardMini from '@common/persona/PersonaCardMini';

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
  const [currentProject, setCurrentProject] = useRecoilState(currentProjectState);

  const activeTab = location.pathname?.split("/")[1];
  const activeSubTab = location.pathname?.split("/")[2];

  const [loadingPersonas, setLoadingPersonas] = useState(false);
  const [personaLinks, setPersonaLinks]: any = useState([]);

  const inboxCount = useRecoilValue(currentInboxCountState)

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

  var siteLinks = [
    {
      mainKey: "inbox",
      label: `Inbox ${inboxCount ? `(${inboxCount})` : "(0)"}`,
      icon: IconInbox,
      links: [
        {
          key: "inbox",
          label: `Inbox ${inboxCount ? `(${inboxCount})` : "(0)"}`,
          icon: IconInbox,
          link: "/inbox",
        },
      ],
    },
     {
      mainKey: "teach",
      label: `1. Teach`,
      icon: IconBrain,
      links: [
        {
          key: "teach",
          label: `Teach`,
          icon: IconBrain,
          link: "/teach",
        },
      ],
    },
    
    {
      mainKey: "prioritize",
      label: `2. Prioritize`,
      icon: IconMilitaryRank,
      links: [
        {
          key: "prioritize",
          label: `prioritize`,
          icon: IconMilitaryRank,
          link: "/prioritize",
        },
      ],
    },
    // {
    //   mainKey: "contacts",
    //   label: `3. Contacts`,
    //   icon: IconAddressBook,
    //   links: [
    //     {
    //       key: "contacts",
    //       label: `Contacts`,
    //       icon: IconAddressBook,
    //       link: "/contacts",
    //     },
    //   ],
    // },
    {
      mainKey: "contacts",
      label: `3. Contacts`,
      icon: IconAddressBook,
      links: [
        {
          key: "contacts-view",
          label: `View Contacts`,
          icon: IconAddressBook,
          link: "/contacts/view",
        },
        {
          key: "contacts-find",
          label: `Find Contacts`,
          icon: IconSearch,
          link: "/contacts/find",
        }
      ],
    },
    {
      mainKey: "linkedin",
      label: "4. LinkedIn",
      icon: IconBrandLinkedin,
      links: [
        // {
        //   key: "linkedin-messages",
        //   label: "Scheduled Messages",
        //   icon: IconMailFast,
        //   link: "/linkedin/messages",
        // },
        // {
        //   key: "linkedin-ctas",
        //   label: "CTAs",
        //   icon: IconSpeakerphone,
        //   link: "/linkedin/ctas",
        // },
        {
          key: "linkedin-setup",
          label: "Linkedin Setup",
          icon: IconAdjustments,
          link: "/linkedin/setup",
        },
        // {
        //   key: "linkedin-campaign-analytics",
        //   label: "Campaign Analytics",
        //   icon: IconReport,
        //   link: "/linkedin/campaign-analytics",
        // },
         {
          key: "linkedin-simulate",
          label: "Simulate",
          icon: IconMessage,
          link: "/linkedin/simulate",
        },
        // {
        //   key: "linkedin-voices",
        //   label: "Voices",
        //   icon: IconVocabulary,
        //   link: "/linkedin/voices",
        // },
      ],
    },
    {
      mainKey: "email",
      label: "5. Email",
      icon: IconMail,
      links: [
        // {
        //   key: "email-scheduled-emails",
        //   label: "Scheduled Emails",
        //   icon: IconMailFast,
        //   link: "/email/scheduled-emails",
        // },
        {
          key: "email-setup",
          label: "Email Setup",
          icon: IconAdjustments,
          link: "/email/setup",
        },
        {
          key: "email-simulate",
          label: "Simulate",
          icon: IconMessage,
          link: "/email/simulate",
        }
        // {
        //   key: "email-blocks",
        //   label: "Email Blocks",
        //   icon: IconWall,
        //   link: "/email/blocks",
        // }
        // { // TODO(Aakash): hidden for now. may require code removal.
        //   key: 'email-sequences',
        //   label: 'Sequences',
        //   icon: IconListDetails,
        //   link: '/email/sequences',
        // },
        /*       {
              key: "email-personalizations",
              label: "Personalizations",
              icon: IconAffiliate,
              link: "/email/personalizations",
            }, */
        // {
        //   key: "email-campaign-analytics",
        //   label: "Campaign Analytics",
        //   icon: IconReport,
        //   link: "/email/campaign-analytics",
        // },
        // { key: 'email-email-details', label: 'Sequence Analysis', icon: IconReport, link: '/email/email-details' },
      ],
    },
    {
      mainKey: "tools",
      label: "Tools",
      icon: IconTools,
      links: [
        {
          key: "tools-filters",
          label: "Filters",
          icon: IconFilter,
          link: "/tools/filters",
        },
        {
          key: "tools-custom-data-point-importer",
          label: "Custom Data Point Importer",
          icon: IconFileLambda,
          link: "/tools/custom-data-point-importer",
        },
        {
          key: "tools-demo-feedback",
          label: "Demo Feedback Repo",
          icon: IconClipboardData,
          link: "/tools/demo-feedback",
        },
        {
          key: "tools-calendar",
          label: "Demo Calendar",
          icon: IconCalendarEvent,
          link: "/tools/calendar",
        },
         {
          key: "email-scraper",
          label: "Email Scraper",
          icon: IconAt,
          link: "/tools/email-scraper",
        },
        {
          key: "tools-contacts-clean",
          label: `Clean Contacts`,
          icon: IconTrash,
          link: "/tools/contacts-clean",
        },
        /*
        {
          key: "tools-campaigns",
          label: `Campaigns`,
          icon: IconMilitaryRank,
          link: "/tools/campaigns",
        },
        */
      ],
    },
    {
      mainKey: "settings",
      label: "Persona Settings",
      icon: IconSettings,
      links: [
        {
          key: "settings-persona",
          label: `Persona Settings`,
          icon: IconSettings,
          link: "/persona/settings",
        },
      ]
    }
  ];

  // If unassigned contact archetype, filter all sections besides Contacts and Inbox (mainKeys.) Then add a split contact tab too
  if (currentProject?.is_unassigned_contact_archetype) {
    siteLinks = siteLinks.filter((link) => {
      return link.mainKey === "contacts" || link.mainKey === "inbox";
    });
    var additional_links = [
      {
        mainKey: "split/contacts",
        label: `Split Contacts`,
        icon: IconSwitchHorizontal,
        links: [
          {
            key: "split/contacts",
            label: `Split`,
            icon: IconSwitchHorizontal,
            link: "/split/contacts",
          },
        ],
      }
    ]
    siteLinks = siteLinks.concat(additional_links);
  }

  const links = siteLinks.map((item) => (
    <LinksGroup {...item} key={item.mainKey} />
  ));

  return (
    <AnimatedNavbar
      style={{
        display: loggedIn ? "flex" : "none",
        justifyContent: "space-between",
        transform: navStyles.x.to((x) => `translate3d(${x}%,0,0)`),
        border: 0,
      }}
      width={{ base: NAV_BAR_SIDE_WIDTH }}
      px="md"
      pb="md"
      className={classes.navbar}
    >
      <Navbar.Section className={classes.header} grow component={ScrollArea}>
        {currentProject?.id && 
          <Box mt='sm' mb='sm'>
            <ProjectSelect />
          </Box>
        }
        <div>{links}</div>
      </Navbar.Section>

      <Navbar.Section className={classes.footer}>

        {currentProject && <Box>
            <PersonaCardMini 
              personaOverview={currentProject} 
              refetch={() => {}} 
              unassignedPersona={currentProject?.is_unassigned_contact_archetype} 
              allPersonas={[]}
              onClick={() => {
                    navigateToPage(navigate, "/persona/settings");
                    setTimeout(() => setNavTab("/persona/settings"), 100);
                }}/>
          </Box>
        }

      </Navbar.Section>
    </AnimatedNavbar>
  );
}
