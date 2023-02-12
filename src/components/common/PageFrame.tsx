import { Stack, Container } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { SCREEN_SIZES } from "../../constants/data";

export default function PageFrame({ children }: { children: React.ReactNode }) {

  const smScreenOrLess = useMediaQuery(`(max-width: ${SCREEN_SIZES.SM})`);

  return (
    <Container
      sx={(theme) => ({
        width: `clamp(260px, ${
          smScreenOrLess ? "80vw" : "calc(100vw - 280px)"
        }, 1000px)`,
        padding: theme.spacing.xl * 1.5,
      })}
    >
      {children}
    </Container>
  );
}