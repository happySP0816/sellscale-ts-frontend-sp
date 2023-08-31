import { Box, Code, Flex, Group, Image, createStyles } from "@mantine/core";
import LogoImg from "@assets/images/logo-white.svg";
import { version } from "../../../package.json";
import { LOGO_HEIGHT, NAV_BAR_TOP_WIDTH } from "@constants/data";

const useStyles = createStyles((theme) => ({
  version: {
    backgroundColor: theme.fn.lighten(
      theme.fn.variant({ variant: "filled", color: "dark" }).background!,
      0.1
    ),
    color: theme.white,
    fontWeight: 700,
    fontSize: 6,
  },
}));

export default function Logo(props: { size?: number }) {
  const { classes, theme, cx } = useStyles();

  return (
    <Flex h={LOGO_HEIGHT} justify="center">
      <Flex
        gap={5}
        justify="center"
        align="center"
        wrap="nowrap"
        className="cursor-pointer"
        sx={{ userSelect: "none" }}
        onClick={() => {
          window.location.href = "/";
        }}
      >
        <Image
          height={props.size || 18}
          sx={{ minWidth: "60px" }}
          fit="contain"
          src={LogoImg}
          alt="SellScale"
        />
        <Code className={classes.version}>v{version}</Code>
      </Flex>
    </Flex>
  );
}
