import { useEffect, useState } from 'react';
import { createStyles, Navbar, Group, Code, getStylesRef, rem, ScrollArea } from '@mantine/core';
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
  IconListDetails,
  IconMailFast,
  IconReport,
  IconUsers,
  IconSpeakerphone,
  IconSettings,
} from '@tabler/icons-react';
import { LogoFull } from '@nav/Logo';
import { LinksGroup } from './NavBarLinksGroup';
import { version } from '../../../package.json';
import { useRecoilState, useRecoilValue } from 'recoil';
import { navTabState } from '@atoms/navAtoms';
import { animated, useSpring } from "@react-spring/web";
import { NAV_BAR_SIDE_WIDTH } from '@constants/data';
import { ProfileCard } from '@nav/ProfileIcon';
import { userDataState } from '@atoms/userAtoms';
import { logout } from '@auth/core';
import { navigateToPage } from '@utils/documentChange';
import { useNavigate } from 'react-router-dom';

const useStyles = createStyles((theme) => ({
  navbar: {
    backgroundColor: theme.fn.variant({ variant: 'filled', color: 'dark' }).background,
  },

  version: {
    backgroundColor: theme.fn.lighten(
      theme.fn.variant({ variant: 'filled', color: 'dark' }).background!,
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
      theme.fn.variant({ variant: 'filled', color: 'dark' }).background!,
      0.1
    )}`,
  },

  footer: {
    paddingTop: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderTop: `${rem(1)} solid ${theme.fn.lighten(
      theme.fn.variant({ variant: 'filled', color: 'dark' }).background!,
      0.1
    )}`,
  },

  link: {
    ...theme.fn.focusStyles(),
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    fontSize: theme.fontSizes.sm,
    color: theme.white,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.radius.sm,
    fontWeight: 500,

    '&:hover': {
      backgroundColor: theme.fn.lighten(
        theme.fn.variant({ variant: 'filled', color: 'dark' }).background!,
        0.1
      ),
    },
  },

  linkIcon: {
    ref: getStylesRef('icon'),
    color: theme.white,
    opacity: 0.75,
    marginRight: theme.spacing.sm,
  },
  linkActive: {
    '&, &:hover': {
      backgroundColor: theme.fn.lighten(theme.fn.variant({ variant: 'filled', color: 'dark' }).background!, 0.15),
      [`& .${getStylesRef('icon')}`]: {
        opacity: 0.9,
      },
      color: theme.white,
    },
  },
}));

const siteLinks = [
  {
    mainKey: 'search',
    label: 'Search',
    icon: IconSearch,
    links: [
      { key: 'search', label: 'Search', icon: IconSearch, link: '/' },
    ],
  },
  {
    mainKey: 'home',
    label: 'Home',
    icon: IconHome,
    links: [
      { key: 'home-dashboard', label: 'Dashboard', icon: IconCheckbox, link: '/home/dashboard' },
      { key: 'home-all-contacts', label: 'Pipeline', icon: IconAddressBook, link: '/home/all-contacts' },
      { key: 'home-recent-activity', label: 'Recent Activity', icon: IconActivity, link: '/home/recent-activity' },
      { key: 'home-demo-feedback', label: 'Demo Feedback Repo', icon: IconClipboardData, link: '/home/demo-feedback' },
    ],
  },
  {
    mainKey: 'linkedin',
    label: 'LinkedIn',
    icon: IconBrandLinkedin,
    links: [
      { key: 'linkedin-messages', label: 'Scheduled Messages', icon: IconMailFast, link: '/linkedin/messages' },
      { key: 'linkedin-ctas', label: 'CTAs', icon: IconSpeakerphone, link: '/linkedin/ctas' },
      { key: 'linkedin-personalizations', label: 'Personalizations', icon: IconAffiliate, link: '/linkedin/personalizations' },
      { key: 'linkedin-campaign-history', label: 'Campaign History', icon: IconHistory, link: '/linkedin/campaign-history' },
    ],
  },
  {
    mainKey: 'email',
    label: 'Email',
    icon: IconMail,
    links: [
      { key: 'email-scheduled-emails', label: 'Scheduled Emails', icon: IconMailFast, link: '/email/scheduled-emails' },
      { key: 'email-sequences', label: 'Sequences', icon: IconListDetails, link: '/email/sequences' },
      { key: 'email-personalizations', label: 'Personalizations', icon: IconAffiliate, link: '/email/personalizations' },
      { key: 'email-campaign-history', label: 'Campaign History', icon: IconHistory, link: '/email/campaign-history' },
      { key: 'email-email-details', label: 'Sequence Analysis', icon: IconReport, link: '/email/email-details' },
    ],
  },
  {
    mainKey: 'personas',
    label: 'Personas',
    icon: IconUsers,
    links: [
      { key: 'personas', label: 'Personas', icon: IconUsers, link: '/personas' },
    ],
  },
];

const AnimatedNavbar = animated(Navbar);

export function NavbarNested(props: { isMobileView: boolean; navOpened: boolean }) {
  const { classes, cx } = useStyles();
  const navigate = useNavigate();
  
  const userData = useRecoilValue(userDataState);
  const [navTab, setNavTab] = useRecoilState(navTabState);

  const activeTab = location.pathname?.split("/")[1];
  const activeSubTab = location.pathname?.split("/")[2];

  const navStyles = useSpring({
    x: props.isMobileView && !props.navOpened ? -NAV_BAR_SIDE_WIDTH * 2 : 0,
  });

  // Update the navTab state when the URL changes
  useEffect(() => {
    let newTab = activeSubTab ? `${activeTab.trim()}-${activeSubTab.trim()}` : activeTab.trim();
    newTab = (newTab === "" || newTab === "home") ? "home-dashboard" : newTab;
    navigateToPage(navigate, `/${newTab.replace("-", "/")}`);
    setTimeout(() => setNavTab(newTab), 100);
  }, [activeTab, activeSubTab, setNavTab]);


  const links = siteLinks.map((item) => <LinksGroup {...item} key={item.mainKey} />);

  return (
    <AnimatedNavbar
      style={{
        display: "flex",
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

      <Navbar.Section grow component={ScrollArea}>
        <div>{links}</div>
      </Navbar.Section>

      <Navbar.Section className={classes.footer}>
        <ProfileCard
          imgUrl={userData?.img_url || ''}
          name={userData?.sdr_name || ''}
          email={userData?.sdr_email || ''}
        />

        <a href="#"
        className={cx(classes.link, { [classes.linkActive]: 'settings' === navTab})}
        onClick={(event) => {
          event.preventDefault();
          navigateToPage(navigate, '/settings');
          setTimeout(() => setNavTab('settings'), 100);
        }}>
          <IconSettings className={classes.linkIcon} stroke={1.5} />
          <span>Settings</span>
        </a>

        <a href="#" className={classes.link} onClick={(event) => {
          event.preventDefault();
          logout(true);
        }}>
          <IconLogout className={classes.linkIcon} stroke={1.5} />
          <span>Logout</span>
        </a>
      </Navbar.Section>
    </AnimatedNavbar>
  );
}