import { DefaultMantineColor, Indicator, Tooltip, useMantineTheme } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { useRecoilState } from "recoil";
import { navTabState } from "../atoms/navAtoms";

type NavTabProps = {
  icon: React.ReactNode;
  name: string;
  description: string;
  onClick: () => void;
  indicatorColor?: DefaultMantineColor;
  dontChangeTab?: boolean;
}

export default function NavTab(props: NavTabProps) {

  const theme = useMantineTheme();
  const [navTab, setNavTab] = useRecoilState(navTabState);
  const { hovered, ref } = useHover();

  return (
    <Tooltip label={props.description} position="right" className="cursor-pointer" onClick={() => {
      if(!props.dontChangeTab){
        setNavTab(props.name);
      }
      props.onClick();
    }} withArrow>
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
          justifyContent: 'center',
          alignItems: 'center',
          height: 55,
          userSelect: 'none',
          // Add alpha channel to hex color (browser support: https://caniuse.com/css-rrggbbaa)
          backgroundColor: hovered || navTab === props.name ? theme.colors.teal[7]+'15' : "transparent",
        }}>
          <Indicator disabled={!props.indicatorColor} dot size={11} color={props.indicatorColor} withBorder>
            {props.icon}
          </Indicator>
        </div>
      </div>
    </Tooltip>
  );
}
