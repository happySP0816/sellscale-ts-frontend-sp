import { useState } from "react";
import { IconSearch } from "@tabler/icons";
import {
  AppShell,
  Navbar,
  Header,
  Burger,
  useMantineTheme,
  Container,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { NAV_BAR_WIDTH, SCREEN_SIZES } from "@constants/data";
import SidePanel from "@nav/SidePanel";
import ProfileIcon from "@nav/ProfileIcon";
import { LogoFull } from "@nav/Logo";
import { animated, useSpring } from "@react-spring/web";
import { openSpotlight } from "@mantine/spotlight";

const AnimatedNavbar = animated(Navbar);

export default function Layout({ children }: { children: React.ReactNode }) {
  const theme = useMantineTheme();

  const smScreenOrLess = useMediaQuery(
    `(max-width: ${SCREEN_SIZES.SM})`,
    false,
    { getInitialValueInEffect: true }
  );

  const isMobileView = smScreenOrLess;

  const [navOpened, setNavOpened] = useState(false);
  const navStyles = useSpring({
    x: isMobileView && !navOpened ? -NAV_BAR_WIDTH * 2 : 0,
  });

  const activeTab = window.location.pathname.replaceAll("/", "");
  console.log(activeTab, navOpened);
  return (
    <AppShell
      className={"h-full"}
      fixed={true}
      navbar={
        <AnimatedNavbar
          style={{
            display: "flex",
            justifyContent: "space-between",
            backgroundColor: theme.colors.dark[7],
            transform: navStyles.x.to((x) => `translate3d(${x}%,0,0)`),
          }}
          width={{ base: NAV_BAR_WIDTH }}
        >
          <Navbar.Section>
            <SidePanel isMobile={isMobileView} />
          </Navbar.Section>
          <Navbar.Section>
            <ProfileIcon
              name="Benedict Cumberbatch"
              email="benny10@cumberbtached.gmail.cvom"
            />
          </Navbar.Section>
        </AnimatedNavbar>
      }
      header={
        isMobileView ? (
          <Header height={NAV_BAR_WIDTH}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "nowrap",
              }}
            >
              <Container p={12} m={0}>
                <Burger
                  opened={navOpened}
                  onClick={() => setNavOpened((o) => !o)}
                  size="sm"
                  color={theme.colors.gray[5]}
                />
              </Container>

              <Container>
                <LogoFull />
              </Container>

              <Container
                p={12}
                m={0}
                className="cursor-pointer"
                onClick={() => openSpotlight()}
              >
                <IconSearch size={22} />
              </Container>
            </div>
          </Header>
        ) : (
          <></>
        )
      }
      styles={(theme) => ({
        main: {
          padding: 0,
          marginTop: isMobileView ? NAV_BAR_WIDTH : 0,
          marginLeft: isMobileView ? 0 : NAV_BAR_WIDTH,
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
