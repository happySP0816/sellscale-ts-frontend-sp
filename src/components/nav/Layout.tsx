import { useState } from "react";
import { IconSearch, IconSettings } from "@tabler/icons";
import {
  AppShell,
  Navbar,
  Header,
  Burger,
  useMantineTheme,
  Container,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { NAV_BAR_SIDE_WIDTH, NAV_BAR_TOP_WIDTH, SCREEN_SIZES } from "@constants/data";
import SidePanel from "@nav/SidePanel";
import ProfileIcon, { ProfileCard } from "@nav/ProfileIcon";
import { LogoFull } from "@nav/Logo";
import { animated, useSpring } from "@react-spring/web";
import { openSpotlight } from "@mantine/spotlight";
import { useRecoilValue } from "recoil";
import { isLoggedIn } from "@auth/core";
import LogoutBtn from "@nav/LogoutBtn";
import { userDataState } from "@atoms/userAtoms";
import NavTab from "./NavTab";
import { navigateToPage } from "@utils/documentChange";
import { useNavigate } from "react-router-dom";

const AnimatedNavbar = animated(Navbar);

export default function Layout({ children }: { children: React.ReactNode }) {
  const theme = useMantineTheme();
  const navigate = useNavigate();

  const userData = useRecoilValue(userDataState);

  const smScreenOrLess = useMediaQuery(
    `(max-width: ${SCREEN_SIZES.SM})`,
    false,
    { getInitialValueInEffect: true }
  );

  const isMobileView = smScreenOrLess;

  const [navOpened, setNavOpened] = useState(false);
  const navStyles = useSpring({
    x: isMobileView && !navOpened ? -NAV_BAR_SIDE_WIDTH * 2 : 0,
  });

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
          width={{ base: NAV_BAR_SIDE_WIDTH }}
        >
          <Navbar.Section>
            <SidePanel isMobile={isMobileView} />
          </Navbar.Section>
          <Navbar.Section>
            {isLoggedIn() && (
              <>
                <ProfileCard
                  name={userData?.sdr_name || ''}
                  email={userData?.sdr_email || ''}
                />
                <NavTab
                  icon={<IconSettings size={22} />}
                  name="settings"
                  description="Configure your SellScale settings"
                  onClick={() => navigateToPage(navigate, `/settings`)}
                />
                <LogoutBtn />
              </>
            )}
          </Navbar.Section>
        </AnimatedNavbar>
      }
      header={
        isMobileView ? (
          <Header height={NAV_BAR_TOP_WIDTH}>
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
          marginTop: isMobileView ? NAV_BAR_TOP_WIDTH : 0,
          marginLeft: isMobileView ? 0 : NAV_BAR_SIDE_WIDTH,
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
