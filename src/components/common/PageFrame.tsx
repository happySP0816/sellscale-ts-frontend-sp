import { Stack, Container } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { SCREEN_SIZES } from "../../constants/data";

export default function PageFrame({ children }: { children: React.ReactNode }) {

  const smScreenOrLess = useMediaQuery(`(max-width: ${SCREEN_SIZES.SM})`);

  return (
    <Container
      px={5}
      py={15}
      sx={(theme) => ({
        width: `clamp(260px, ${
          smScreenOrLess ? "80vw" : "calc(100vw - 280px)"
        }, 1100px)`,
        maxWidth: "100%",
      })}
    >
      {children}
    </Container>
  );
}