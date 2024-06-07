import { useEffect, useState } from "react";
import { AppShell, Navbar, Header, Burger, useMantineTheme, Container, Text, Box, Button, Group } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { HEADER_HEIGHT, NAV_BAR_SIDE_WIDTH, NAV_BAR_TOP_WIDTH, SCREEN_SIZES } from "@constants/data";
import { useRecoilValue } from "recoil";
import { isLoggedIn } from "@auth/core";
import { adminDataState, userDataState } from "@atoms/userAtoms";
import { version } from "../../../package.json";
import SideNavbar from "./SideNavbar";
import { currentProjectState } from "@atoms/personaAtoms";
import { showNotification } from "@mantine/notifications";
import { IconPlugConnected } from "@tabler/icons";
import AdminHeader from "./AdminHeader";

export default function Layout({ children }: { children: React.ReactNode }) {
  const theme = useMantineTheme();

  const userData = useRecoilValue(userDataState);
  const adminData = useRecoilValue(adminDataState);
  const currentProject = useRecoilValue(currentProjectState);

  const smScreenOrLess = useMediaQuery(`(max-width: ${SCREEN_SIZES.SM})`, false, {
    getInitialValueInEffect: true,
  });

  const isMobileView = smScreenOrLess;

  const [navOpened, setNavOpened] = useState(false);

  // useEffect(() => {
  //   if(userData && userData.li_voyager_connected === false) {
  //     showNotification({
  //       id: "inactive-linkedin",
  //       title: (
  //         <Group>
  //           <Text fz='md'>LinkedIn Not Connected</Text>
  //           <Button leftIcon={<IconPlugConnected size='0.9rem' />} variant="light" color="red" size="xs" radius="xl" compact
  //             onClick={() => {
  //               window.location.href = "/settings/linkedin";
  //             }}
  //           >Go to Connect</Button>
  //         </Group>
  //       ),
  //       message: `Looks like your LinkedIn account isn't connect. Please connect.`,
  //       color: "red",
  //       autoClose: false,
  //     });
  //   }
  // }, [userData]);

  return (
    <AppShell
      className={"h-full"}
      fixed={true}
      navbar={<>{isLoggedIn() && <SideNavbar />}</>}
      header={
        adminData?.role === "ADMIN" ? <AdminHeader /> : undefined
        /*
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
        )*/
      }
      styles={(theme) => ({
        main: {
          padding: 0,
          marginTop: 0, //isMobileView ? NAV_BAR_TOP_WIDTH : 0,
          marginLeft: 0, //isMobileView ? 0 : NAV_BAR_SIDE_WIDTH,
          minHeight: `calc(100vh - ${adminData?.role === "ADMIN" ? HEADER_HEIGHT : 0}px)`,
          height: `calc(100vh - ${adminData?.role === "ADMIN" ? HEADER_HEIGHT : 0}px)`,
          width: "calc(100vw - 10rem)",
        },
        body: {
          backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[0],
          backgroundSize: "cover",
        },
      })}
    >
      <main
        style={{
          overflowY: "auto",
          minHeight: `calc(100vh - ${adminData?.role === "ADMIN" ? HEADER_HEIGHT : 0}px)`,
          height: `calc(100vh - ${adminData?.role === "ADMIN" ? HEADER_HEIGHT : 0}px)`,
        }}
      >
        {children}
      </main>
    </AppShell>
  );
}
