import FlexSeparate from "@common/library/FlexSeparate";
import { DefaultMantineColor, Indicator, Tooltip, useMantineTheme, Text, Container } from "@mantine/core";
import { useHover, useOs } from "@mantine/hooks";
import { startCase } from "lodash";
import { useRecoilState } from "recoil";
import { navTabState } from "../../atoms/navAtoms";
import { formatToLabel } from "@utils/general";

type NavTabProps = {
  icon: React.ReactNode;
  name: string;
  description: string;
  onClick: () => void;
  indicatorColor?: DefaultMantineColor;
  dontChangeTab?: boolean;
  sideContent?: React.ReactNode;
}

export default function NavTab(props: NavTabProps) {

  const theme = useMantineTheme();
  const [navTab, setNavTab] = useRecoilState(navTabState);
  const { hovered, ref } = useHover();

  return (
    <Tooltip label={props.description} withArrow openDelay={1000} position="right" className="cursor-pointer" onClick={() => {
      if(!props.dontChangeTab){
        setNavTab(props.name);
      }
      props.onClick();
    }}>
      <div ref={ref} style={{
        display: 'flex',
      }}>
        <div style={{
          width: 2,
          height: 55,
          // Add alpha channel to hex color (browser support: https://caniuse.com/css-rrggbbaa)
          backgroundColor: hovered || navTab === props.name ? theme.colors.teal[7]+'50' : "transparent",
        }}></div>
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          height: 55,
          userSelect: 'none',
          // Add alpha channel to hex color (browser support: https://caniuse.com/css-rrggbbaa)
          backgroundColor: hovered || navTab === props.name ? theme.colors.teal[7]+'15' : "transparent",
        }}>
          <Container p={5} m={0} sx={{ lineHeight: '0px' }}>
            <Indicator disabled={!props.indicatorColor} size={11} color={props.indicatorColor} withBorder>
              {props.icon}
            </Indicator>
          </Container>
          <Container pl={3} pr={0} m={0}>
            <FlexSeparate>
              <Text fz="sm">{formatToLabel(props.name)}</Text>
              {props.sideContent && (
                props.sideContent
              )}
            </FlexSeparate>
          </Container>
        </div>
      </div>
    </Tooltip>
  );
}


/*

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
                  imgUrl={userData?.img_url || ''}
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


*/