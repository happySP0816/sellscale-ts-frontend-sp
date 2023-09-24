import { IconArrowNarrowRight, IconBookmark } from "@tabler/icons-react";
import { Box, useMantineTheme, Button, Title } from "@mantine/core";

export function SidebarFooter() {
  const theme = useMantineTheme();

  return (
    <Box
      sx={{
        padding: theme.spacing.sm,
        boxShadow: "0px 0px 10px 0px rgba(0, 0, 0, 0.15)",
        display: "flex",

        flexDirection: "column",
      }}
    >
      <Button rightIcon={<IconArrowNarrowRight size={24} />} fullWidth>
        Start Filtering
      </Button>

      <Box
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "0.5rem",
        }}
      >
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            color: theme.colors.gray[6],
          }}
        >
          <IconBookmark size={16} />
          <Title size={"12px"}>Saved filters</Title>
        </Box>
        <Button variant="light" size="xs">
          Save search
        </Button>
      </Box>
    </Box>
  );
}
