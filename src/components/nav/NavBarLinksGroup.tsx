import { useEffect, useState } from "react";
import {
  Group,
  Box,
  Collapse,
  ThemeIcon,
  Text,
  UnstyledButton,
  createStyles,
  rem,
  getStylesRef,
  Flex,
  Code,
} from "@mantine/core";
import {
  IconArrowNarrowRight,
  IconCalendarStats,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { navigateToPage } from "@utils/documentChange";
import { navTabState } from "@atoms/navAtoms";
import { useRecoilState } from "recoil";
import { useOs } from "@mantine/hooks";
import { openSpotlight } from "@mantine/spotlight";

const useStyles = createStyles((theme) => ({
  control: {
    fontWeight: 500,
    display: "block",
    width: "100%",
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    color: theme.colors.dark[0],
    fontSize: theme.fontSizes.sm,

    "&:hover": {
      backgroundColor: theme.colors.dark[7],
      color: theme.white,
    },
  },

  version: {
    backgroundColor: theme.fn.lighten(
      theme.fn.variant({ variant: "filled", color: "dark" }).background!,
      0.1
    ),
    color: theme.colors.dark[0],
    fontSize: 10,
    fontWeight: 700,
    position: "absolute",
    right: 10,
    top: 12,
  },

  link: {
    fontWeight: 500,
    display: "block",
    textDecoration: "none",
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    paddingLeft: rem(31),
    marginLeft: rem(30),
    marginTop: rem(1),
    marginBottom: rem(1),
    fontSize: theme.fontSizes.sm,
    color: theme.colors.dark[0],
    borderLeft: `${rem(1)} solid ${theme.colors.dark[4]}`,
    borderTopRightRadius: theme.radius.sm,
    borderBottomRightRadius: theme.radius.sm,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,

    "&:hover": {
      backgroundColor: theme.fn.lighten(
        theme.fn.variant({ variant: "filled", color: "dark" }).background!,
        0.1
      ),
      color: theme.white,
    },
  },

  chevron: {
    transition: "transform 200ms ease",
    position: "absolute",
    right: 10,
    top: 12,
  },

  baseLink: {
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
    height: "100%",
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
}));

interface LinksGroupProps {
  icon: React.FC<any>;
  label: string;
  mainKey: string;
  links: { label: string; link: string; key: string; icon: React.FC<any> }[];
}

export function LinksGroup({
  icon: Icon,
  label,
  mainKey,
  links,
}: LinksGroupProps) {
  const { classes, theme, cx } = useStyles();
  const navigate = useNavigate();
  const os = useOs();

  const [navTab, setNavTab] = useRecoilState(navTabState);
  const [opened, setOpened] = useState(false);

  // When change what's active, make sure the correct drawer is open
  useEffect(() => {
    setOpened(mainKey === navTab || links?.some((link) => link.key === navTab));
  }, [navTab]);

  const hasLinkList = links.length > 1;

  const ChevronIcon = theme.dir === "ltr" ? IconChevronRight : IconChevronLeft;
  const items = (hasLinkList ? links : []).map((link, index) => (
    <Text<"a">
      component="a"
      className={cx(classes.link, {
        [classes.linkActive]: link.key === navTab,
      })}
      href={""}
      key={index}
      onClick={(event) => {
        event.preventDefault();
        navigateToPage(navigate, link.link);

        setTimeout(() => {
          setNavTab(link.key);
          if (link.link.includes("persona")) {
            window.location.reload();
          }
        }, 100);
      }}
    >
      <Flex>
        <div>
          <link.icon className={classes.linkIcon} size={15} stroke={1.5} />
        </div>
        <div>{link.label}</div>
      </Flex>
    </Text>
  ));

  // Change the name of the label to show when the drawer is opened or not
  let linkLabel = label;
  if (!opened && links?.some((link) => link.key === navTab)) {
    linkLabel = `${label} – ${
      links?.find((link) => link.key === navTab)?.label
    }`;
  }

  return (
    <>
      <Text<"a">
        component="a"
        className={cx(classes.baseLink, {
          [classes.linkActive]:
            mainKey === navTab ||
            (!opened && links?.some((link) => link.key === navTab)),
        })}
        sx={{ position: "relative" }}
        href={""}
        key={label}
        onClick={(event) => {
          event.preventDefault();

          if (mainKey === "search") {
            openSpotlight();
            return;
          }

          if (hasLinkList) {
            setOpened((o) => !o);
          } else {
            navigateToPage(navigate, links[0].link);
            setTimeout(() => setNavTab(mainKey), 100);
          }
        }}
      >
        <Icon className={classes.linkIcon} stroke={1.5} />
        <span>{linkLabel}</span>
        {hasLinkList && (
          <ChevronIcon
            className={classes.chevron}
            size="1.2rem"
            stroke={1.5}
            style={{
              transform: opened
                ? `rotate(${theme.dir === "rtl" ? -90 : 90}deg)`
                : "none",
            }}
          />
        )}
        {mainKey === "search" && (
          <Code className={classes.version}>
            {os === "undetermined" || os === "macos" ? "⌘" : "Ctrl"} + K
          </Code>
        )}
      </Text>
      {hasLinkList ? <Collapse in={opened}>{items}</Collapse> : null}
    </>
  );
}
