import { useContext, useState } from "react";
import { IconSun, IconMoonStars } from "@tabler/icons";
import {
  AppShell,
  Navbar,
  Header,
  Group,
  ActionIcon,
  useMantineColorScheme,
  MediaQuery,
  Burger,
  useMantineTheme,
  Button,
  Title,
  Center,
} from "@mantine/core";
import { Logo } from "./nav/Logo";
import { useMediaQuery } from "@mantine/hooks";
import { NAV_BAR_WIDTH, SCREEN_SIZES } from "../constants/data";
import { SearchBar } from "./nav/SearchBar";
import { SidePanel } from "./nav/SidePanel";
import { openContextModal } from "@mantine/modals";
import { UserContext } from "../contexts/user";
import { useNavigate } from "react-router-dom";

export default function Layout({ children }: { children: React.ReactNode }) {
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const userContext = useContext(UserContext);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const smScreenOrLess = useMediaQuery(`(max-width: ${SCREEN_SIZES.SM})`);
  const mdScreenOrLess = useMediaQuery(`(max-width: ${SCREEN_SIZES.MD})`);

  const [opened, setOpened] = useState(false);

  const activeTab = window.location.pathname.replaceAll("/", "");
  console.log(activeTab);
  return (
    <AppShell
      className={"h-full"}
      fixed={true}
      navbar={
        <Navbar
          width={{ base: NAV_BAR_WIDTH }}
          sx={{
            backgroundColor: theme.colors.dark[7],
          }}
        >
          <Navbar.Section style={{ flex: 1 }}>
            <Center>
              <Logo />
            </Center>
            <SidePanel />
          </Navbar.Section>
        </Navbar>
      }
      styles={(theme) => ({
        main: {
          padding: 0,
          marginLeft: NAV_BAR_WIDTH,
        },
        body: {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
          backgroundSize: "cover",
          overflowY: "auto",
        },
      })}
    >
      <main>{children}</main>
    </AppShell>
  );
}
