import { Stack, Container } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { SCREEN_SIZES } from "../../constants/data";

export default function PageFrame({ children }: { children: React.ReactNode }) {

  const smScreenOrLess = useMediaQuery(`(max-width: ${SCREEN_SIZES.SM})`);

  return (
    <Container
      sx={{
        width: `clamp(260px, ${
          smScreenOrLess ? "80vw" : "calc(100vw - 280px)"
        }, 1000px)`,
      }}
      p={0}
    >
      {children}
    </Container>
  );
}