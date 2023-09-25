import { useState } from "react";
import { Group, Box, rem, Title, Input } from "@mantine/core";
import {
  IconAdjustmentsHorizontal,
  IconChevronDown,
  IconChevronUp,
  IconSearch,
  IconUser,
} from "@tabler/icons-react";

export function SidebarHeader() {
  const [showGeneralSearchBar, setShowGeneralSearchBar] = useState(false);

  return (
    <>
      <Box
        sx={(theme) => ({
          padding: theme.spacing.sm,
          borderBottom: `${rem(1)} solid ${
            theme.colorScheme === "dark"
              ? theme.colors.dark[4]
              : theme.colors.gray[2]
          }`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          backgroundColor: theme.fn.variant({
            variant: "filled",
            color: theme.primaryColor,
          }).background,
        })}
      >
        <Group position="apart" style={{ width: "100%" }} display={"flex"}>
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#fff",
            }}
          >
            <IconUser size={24} />
            <Title size={"14px"}>Senior Engineering Hiring</Title>
            {showGeneralSearchBar && (
              <IconChevronUp
                size={24}
                color={"#fff"}
                onClick={() => setShowGeneralSearchBar(!showGeneralSearchBar)}
              />
            )}
            {!showGeneralSearchBar && (
              <IconChevronDown
                size={24}
                color={"#fff"}
                onClick={() => setShowGeneralSearchBar(!showGeneralSearchBar)}
              />
            )}
          </Box>
        </Group>
      </Box>
    </>
  );
}
