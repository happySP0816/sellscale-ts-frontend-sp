import React, { useContext } from "react";
import {
  IconInbox,
  IconHistory,
  IconHome2,
  IconAffiliate,
  IconSpeakerphone,
  IconAssembly,
} from "@tabler/icons";
import {
  ThemeIcon,
  UnstyledButton,
  Group,
  Text,
  Accordion,
  Flex,
  MantineTheme,
} from "@mantine/core";
import { UserContext } from "../../contexts/user";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "react-query";

type PanelLinkProps = {
  icon: React.ReactNode;
  color: string;
  label: string;
  onClick: () => void;
  isActive: boolean;
};

function getHoverColor(theme: MantineTheme) {
  // Add alpha channel to hex color (browser support: https://caniuse.com/css-rrggbbaa)
  return (
    (theme.colorScheme === "dark"
      ? theme.colors.dark[6]
      : theme.colors.gray[0]) + "50"
  );
}

function PanelLink({ icon, color, label, onClick, isActive }: PanelLinkProps) {
  return (
    <UnstyledButton
      my={4}
      sx={(theme) => ({
        display: "block",
        width: "180px",
        padding: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        color:
          theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,

        "&:hover": {
          backgroundColor: getHoverColor(theme),
        },
        backgroundColor: isActive ? getHoverColor(theme) : "inherit",
      })}
      onClick={onClick}
    >
      <Group>
        <ThemeIcon color={color} variant="light" radius="xl">
          {icon}
        </ThemeIcon>
        <Text size="sm">{label}</Text>
      </Group>
    </UnstyledButton>
  );
}

export function SidePanel() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div>
      <PanelLink
        icon={<IconHome2 size={16} />}
        color={"gray"}
        label={`Home`}
        isActive={location.pathname === "/" || location.pathname === ""}
        onClick={() => {
          navigate(`/`);
        }}
      />

      <PanelLink
        icon={<IconInbox size={16} />}
        color={"gray"}
        label={`Inbox`}
        isActive={location.pathname?.toLowerCase() === "/inbox"}
        onClick={() => {
          navigate(`/inbox`);
        }}
      />

      <PanelLink
        icon={<IconAffiliate size={16} />}
        color={"gray"}
        label={`Prospects`}
        isActive={location.pathname?.toLowerCase() === "/prospects"}
        onClick={() => {
          navigate(`/prospects`);
        }}
      />

      <PanelLink
        icon={<IconSpeakerphone size={16} />}
        color={"gray"}
        label={`CTAs`}
        isActive={location.pathname?.toLowerCase() === "/call-to-actions"}
        onClick={() => {
          navigate(`/call-to-actions`);
        }}
      />

      <PanelLink
        icon={<IconAssembly size={16} />}
        color={"gray"}
        label={`Campaigns`}
        isActive={location.pathname?.toLowerCase() === "/campaigns"}
        onClick={() => {
          navigate(`/campaigns`);
        }}
      />
    </div>
  );
}

/*

const HISTORY = [
  { name: "Entry", value: "1" },
  { name: "Entry", value: "2" },
];


      <Accordion variant="filled" my={4}>
        <Accordion.Item
          value="recently-viewed"
          sx={(theme) => ({
            "&[data-active]": {
              backgroundColor: getHoverColor(theme),
            },
          })}
        >
          <Accordion.Control
            icon={
              <ThemeIcon color={"grape"} variant="light">
                <IconHistory size={16} />
              </ThemeIcon>
            }
            p={10}
            sx={(theme) => ({
              borderRadius: theme.radius.sm,

              "&:hover": {
                backgroundColor: getHoverColor(theme),
              },
            })}
          >
            <Text size="sm" ml={4}>{`Two`}</Text>
          </Accordion.Control>
          <Accordion.Panel
            sx={{
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            {HISTORY.map((h) => {
              return (
                <UnstyledButton
                  key={`recent-history-${h.value}`}
                  onClick={() => {
                    navigate(`/`);
                  }}
                  sx={(theme) => ({
                    display: "block",
                    width: "100%",
                    padding: theme.spacing.xs,
                    borderRadius: theme.radius.sm,
                    color:
                      theme.colorScheme === "dark"
                        ? theme.colors.dark[0]
                        : theme.black,

                    "&:hover": {
                      backgroundColor: getHoverColor(theme),
                    },
                  })}
                >
                  <Flex
                    gap="md"
                    justify="space-between"
                    wrap="nowrap"
                    align="center"
                  >
                    <Text
                      size="sm"
                      fw={700}
                      sx={{
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h.value}
                    </Text>
                    <Text
                      size="sm"
                      sx={{
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {h.name}
                    </Text>
                  </Flex>
                </UnstyledButton>
              );
            })}
            {HISTORY.length === 0 && (
              <Text
                ta="center"
                fs="italic"
                fz="sm"
                c="dimmed"
                pt={10}
              >{`No records`}</Text>
            )}
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
*/
