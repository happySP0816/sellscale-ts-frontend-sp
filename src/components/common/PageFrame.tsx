import { Stack, Container } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { SCREEN_SIZES } from "../../constants/data";
import { NAV_HEADER_HEIGHT } from "@nav/MainHeader";

export default function PageFrame({ children }: { children: React.ReactNode }) {

  const smScreenOrLess = useMediaQuery(`(max-width: ${SCREEN_SIZES.SM})`);

  return (
    <Container
      px={5}
      py={15}
      sx={(theme) => ({
        width: `clamp(50px, ${
          smScreenOrLess ? "90vw" : "calc(100vw - 50px)"
        }, 1300px)`,
        maxWidth: "100%",
      })}
    >
      {children}
    </Container>
  );
}