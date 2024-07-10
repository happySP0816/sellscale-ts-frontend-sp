import { ActionIcon, Button, Divider, Flex, Paper, Switch, Text, Title } from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import { IconEdit, IconFilter, IconPlus, IconUsers } from "@tabler/icons";
import { useState } from "react";

export default function PreFilterV2() {
  const [prefilters, setPrefilters] = useState<any>([
    {
      title: "Digital Health Outreach Filters",
      prospects: 542809,
      status: true,
    },
    {
      title: "Digital Health Outreach Filters",
      prospects: 542809,
      status: false,
    },
    {
      title: "Digital Health Outreach Filters",
      prospects: 542809,
      status: false,
    },
  ]);
  return (
    <Paper withBorder shadow="md" radius={"sm"} p={"md"}>
      <Flex align={"center"} justify={"space-between"} mt={"sm"}>
        <Text size={20} fw={700} color="gray">
          Pre-filters
        </Text>
        <Button
          leftIcon={<IconPlus size={"1rem"} />}
          onClick={() => {
            openContextModal({
              modal: "prefilterEditModal",
              title: (
                <Title order={3} className="flex items-center gap-2">
                  <IconFilter size={"1.5rem"} color="#228be6" /> Edit Pre-filter
                </Title>
              ),
              innerProps: {},
              centered: true,
              styles: {
                content: {
                  minWidth: "930px",
                },
              },
            });
          }}
        >
          Add Pre-filter
        </Button>
      </Flex>
      <Text color="gray" size={"sm"} fw={500} mt={"sm"}>
        Pre-filters are applied before segment filters take effect. Set up pre-filters to apply foundational criteria to ensure that all subsequent filters
        align with your core requirements.
      </Text>
      <Divider mt={"sm"} />
      {prefilters.map((item: any, index: number) => {
        return (
          <Paper withBorder p={"sm"} radius={"sm"} className="flex justify-between" mt={"sm"}>
            <Flex align={"center"} gap={3}>
              <Text color="gray" fw={500} size={"sm"}>
                Pre-filter #{index + 1}:
              </Text>
              <Text fw={600} size={"sm"}>
                {item.title}
              </Text>
              <Divider orientation="vertical" mx={"xs"} />
              <IconUsers color="gray" size={"1rem"} />
              <Text color="gray" fw={500} size={"sm"}>
                <span className="font-semibold">{item.prospects}</span> Prospects
              </Text>
            </Flex>
            <Flex align={"center"} gap={"sm"}>
              <ActionIcon
                size={"sm"}
                onClick={() => {
                  openContextModal({
                    modal: "prefilterEditModal",
                    title: (
                      <Title order={3} className="flex items-center gap-2">
                        <IconFilter size={"1.5rem"} color="#228be6" /> Edit Pre-filter
                      </Title>
                    ),
                    innerProps: {},
                    centered: true,
                    styles: {
                      content: {
                        minWidth: "930px",
                      },
                    },
                  });
                }}
              >
                <IconEdit />
              </ActionIcon>
              <Switch defaultChecked={item.status} size="sm" />
            </Flex>
          </Paper>
        );
      })}
    </Paper>
  );
}
