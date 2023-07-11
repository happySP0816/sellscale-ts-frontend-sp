
import { navTabState } from '@atoms/navAtoms';
import { currentProjectState } from '@atoms/personaAtoms';
import { Button, Menu, Text, createStyles, useMantineTheme } from '@mantine/core';
import {
  IconSquareCheck,
  IconPackage,
  IconUsers,
  IconCalendar,
  IconChevronDown,
  IconInbox,
  IconAddressBook,
  IconFilter,
  IconActivity,
  IconBrandLinkedin,
  IconMail,
} from '@tabler/icons-react';
import { navigateToPage } from '@utils/documentChange';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';


const useStyles = createStyles((theme) => ({

  select: {
    backgroundColor: theme.fn.lighten(
      theme.fn.variant({ variant: "filled", color: "dark" }).background!,
      0.15
    ),
    color: theme.white,
    fontWeight: 700,

    '&:hover': {
      backgroundColor: theme.fn.lighten(
        theme.fn.variant({ variant: 'filled', color: 'dark' }).background!,
        0.18
      ),
    },
  },

}));

const options = [
  {
    label: 'Global Inboxes',
    icon: <IconInbox size="1rem" stroke={1.5} />,
    value: 'all-inboxes',
  },
  {
    label: 'Global Contacts',
    icon: <IconAddressBook size="1rem" stroke={1.5} />,
    value: 'all-contacts',
  },
  {
    label: 'Global Recent Activity',
    icon: <IconActivity size="1rem" stroke={1.5} />,
    value: 'all-recent-activity',
  },
  {
    label: 'Global LinkedIn Messages',
    icon: <IconBrandLinkedin size="1rem" stroke={1.5} />,
    value: 'all-linkedin-messages',
  },
  {
    label: 'Global Email Messages',
    icon: <IconMail size="1rem" stroke={1.5} />,
    value: 'all-email-messages',
  },
];

export function GlobalPageSelect() {
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const navigate = useNavigate();

  const [navTab, setNavTab] = useRecoilState(navTabState);
  const [currentProject, setCurrentProject] = useRecoilState(currentProjectState);

  return (
    <Menu
      width={250}
      withinPortal
      withArrow
    >
      <Menu.Target>
        <Button
          size='sm'
          sx={{backgroundColor: options.find((option) => option.value === navTab)?.label ? '#4298f5' : ''}}
          className={classes.select}
          rightIcon={<IconChevronDown size="1.05rem" stroke={1.5} />}
          pr={12}
          leftIcon={<IconInbox size="1.2rem" stroke={2} />}
        >
          {options.find((option) => option.value === navTab)?.label || 'Global View'}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        {options.map((option, index) => (
          <Menu.Item
            key={index}
            disabled={option.value === navTab}
            icon={option.icon}
            onClick={() => {
              setNavTab(option.value);
              navigateToPage(navigate, `/`+option.value);
              setCurrentProject(null);
            }}
          >
            {option.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}