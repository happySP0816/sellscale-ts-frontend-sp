import React, { useContext, useEffect } from "react";
import {
  IconInbox,
  IconHistory,
  IconSearch,
  IconAffiliate,
  IconSpeakerphone,
  IconAssembly,
  IconHome,
} from "@tabler/icons";
import {
  ThemeIcon,
  UnstyledButton,
  Group,
  Text,
  Accordion,
  Flex,
  MantineTheme,
  Center,
} from "@mantine/core";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "react-query";
import NavTab from "./NavTab";
import { LogoIcon } from "@nav/Logo";
import { LOGO_HEIGHT } from "../../constants/data";
import ProfileIcon from "./ProfileIcon";
import { useOs } from "@mantine/hooks";
import { openSpotlight } from "@mantine/spotlight";
import { useRecoilState } from "recoil";
import { navTabState } from "@atoms/navAtoms";

type PanelLinkProps = {
  icon: React.ReactNode;
  color: string;
  label: string;
  onClick: () => void;
  isActive: boolean;
};

function getHoverColor(theme: MantineTheme) {
  // Add alpha channel to hex color (browser support: https://caniuse.com/css-rrggbbaa)
  return (
    (theme.colorScheme === "dark"
      ? theme.colors.dark[6]
      : theme.colors.gray[0]) + "50"
  );
}

function PanelLink({ icon, color, label, onClick, isActive }: PanelLinkProps) {
  return (
    <UnstyledButton
      my={4}
      sx={(theme) => ({
        display: "block",
        width: "180px",
        padding: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        color: theme.colors.dark[0],

        "&:hover": {
          backgroundColor: getHoverColor(theme),
        },
        backgroundColor: isActive ? getHoverColor(theme) : "inherit",
      })}
      onClick={onClick}
    >
      <Group>
        <ThemeIcon color={color} variant="light" radius="xl">
          {icon}
        </ThemeIcon>
      </Group>
    </UnstyledButton>
  );
}

export default function SidePanel(props: { isMobile?: boolean }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const os = useOs();

  const [navTab, setNavTab] = useRecoilState(navTabState);
  const activeTab = location.pathname?.split("/")[1];

  useEffect(() => {
    setNavTab(activeTab.trim() === "" ? "home" : activeTab);
  }, [activeTab, setNavTab]);

  return (
    <>
      <div>
        {!props.isMobile && (
          <Center h={50}>
            <LogoIcon />
          </Center>
        )}

        {!props.isMobile && (
          <NavTab
            icon={<IconSearch size={22} />}
            name="search"
            description={`Search | ${
              os === "undetermined" || os === "macos" ? "⌘" : "Ctrl"
            } + K`}
            onClick={() => openSpotlight()}
            dontChangeTab={true}
          />
        )}

        <NavTab
          icon={<IconHome size={22} />}
          name="home"
          description="Home"
          onClick={() => navigate(`/home`)}
        />

        <NavTab
          icon={<IconInbox size={22} />}
          name="pipeline"
          description="Pipeline"
          onClick={() => navigate(`/pipeline`)}
        />

        <NavTab
          icon={<IconAffiliate size={22} />}
          name="personas"
          description="Personas"
          onClick={() => navigate(`/personas`)}
        />

        <NavTab
          icon={<IconAssembly size={22} />}
          name="campaigns"
          description="Campaigns"
          onClick={() => navigate(`/campaigns`)}
        />
      </div>
    </>
  );
}
