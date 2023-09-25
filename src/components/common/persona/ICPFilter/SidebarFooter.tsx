import { IconArrowNarrowRight, IconBookmark } from "@tabler/icons-react";
import { Box, useMantineTheme, Button, Title, Text } from "@mantine/core";
type Props = {
  isTesting: boolean;
};
export function SidebarFooter({ isTesting }: Props) {
  const theme = useMantineTheme();

  return (
    <Box
      sx={{
        padding: theme.spacing.sm,
        boxShadow: "0px 0px 10px 0px rgba(0, 0, 0, 0.15)",
        display: "flex",
        marginTop: "auto",
        flexDirection: "column",
      }}
    >
      <Box>
        {isTesting ? (
          <Text color="red" fz={"0.75rem"} fw={700}>
            Test Mode: Note that you are currently in test mode and only running
            scoring on 50 prospects.
          </Text>
        ) : (
          <Text color="red" fz={"0.75rem"} fw={700}>
            Warning: You are about to run on all prospects and this may take a
            while. Run on a sample of 50 prospects to see results faster.
          </Text>
        )}
      </Box>
      <Button
        rightIcon={isTesting ? null : <IconArrowNarrowRight size={24} />}
        mt={"0.5rem"}
        fullWidth
        color={isTesting ? "blue" : "red"}
      >
        {isTesting ? "Filter test sample" : "Start Filtering"}
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
