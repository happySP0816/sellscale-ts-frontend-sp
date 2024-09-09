import { Avatar, Badge, Box, Button, Flex, Paper, Stack, Switch, Text } from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { IconBuilding, IconClock, IconInfoCircle, IconLetterT, IconLoader, IconSwitch, IconTargetArrow, IconToggleRight, IconUser } from "@tabler/icons";
import { DataGrid } from "mantine-data-grid";

export default function OverrideProspectsModal({ context, id, innerProps }: ContextModalProps<{ data: any }>) {
  return (
    <Stack spacing={"sm"}>
      <Text fw={400} color="gray" size={"sm"}>
        Ready to Upload? <span className="font-semibold text-black">We have found some prospects that are already to your prospect database.</span>
        Please check the prospects that you want to overwrite and move to your new segment/campaign.
      </Text>
      <DataGrid
        data={innerProps.data}
        withBorder
        withColumnBorders
        withRowSelection
        columns={[
          {
            accessorKey: "prospect_name",
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconLetterT color="gray" size={"0.9rem"} />
                <Text color="gray">Prospect Name</Text>
              </Flex>
            ),
            maxSize: 250,
            minSize: 250,
            cell: (cell) => {
              const { avatar, full_name } = cell.row.original;

              return (
                <Flex gap={"xs"} w={"100%"} h={"100%"} align={"center"}>
                  <Avatar src={avatar} size={"md"} radius={"xl"} />
                  <Text fw={500}>{full_name}</Text>
                </Flex>
              );
            },
          },
          {
            accessorKey: "company",
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconBuilding color="gray" size={"0.9rem"} />
                <Text color="gray">Company</Text>
              </Flex>
            ),

            enableResizing: true,
            cell: (cell) => {
              const { company } = cell.row.original;

              return (
                <Flex align={"center"} gap={"xs"} py={"sm"} w={"100%"} h={"100%"}>
                  <Text fw={500}>{company}</Text>
                </Flex>
              );
            },
          },
          {
            accessorKey: "title",
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconLetterT color="gray" size={"0.9rem"} />
                <Text color="gray">Title</Text>
              </Flex>
            ),
            maxSize: 200,
            minSize: 200,
            cell: (cell) => {
              const { title } = cell.row.original;

              return (
                <Flex gap={"xs"} w={"100%"} h={"100%"} align={"center"}>
                  <Text fw={500} lineClamp={2} maw={200}>
                    {title}
                  </Text>
                </Flex>
              );
            },
          },
          {
            accessorKey: "sdr",
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconUser color="gray" size={"0.9rem"} />
                <Text color="gray">SDR</Text>
              </Flex>
            ),

            enableResizing: true,
            cell: (cell) => {
              const { sdr } = cell.row.original;

              return (
                <Flex align={"center"} gap={"xs"} py={"sm"} w={"100%"} h={"100%"}>
                  <Text fw={500}>{sdr}</Text>
                </Flex>
              );
            },
          },
          {
            accessorKey: "segment",
            maxSize: 240,
            minSize: 240,
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconClock color="gray" size={"0.9rem"} />
                <Text color="gray">Segment</Text>
              </Flex>
            ),

            enableResizing: true,
            cell: (cell) => {
              const { segment_title } = cell.row.original;

              return (
                <Flex align={"center"} gap={"xs"} py={"sm"} w={"100%"} h={"100%"}>
                  <Text fw={500}>{segment_title ? segment_title : "None"}</Text>
                </Flex>
              );
            },
          },
          {
            accessorKey: "campaign",
            maxSize: 240,
            minSize: 240,
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconTargetArrow color="gray" size={"0.9rem"} />
                <Text color="gray">Campaign</Text>
              </Flex>
            ),

            enableResizing: true,
            cell: (cell) => {
              const { archetype } = cell.row.original;

              return (
                <Flex align={"center"} gap={"xs"} py={"sm"} w={"100%"} h={"100%"}>
                  <Text fw={500}>{archetype}</Text>
                </Flex>
              );
            },
          },
          {
            accessorKey: "status",
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconLoader color="gray" size={"0.9rem"} />
                <Text color="gray">Status</Text>
              </Flex>
            ),

            enableResizing: true,
            cell: (cell) => {
              const { status } = cell.row.original;

              return (
                <Flex align={"center"} gap={"xs"} py={"sm"} w={"100%"} h={"100%"}>
                  <Badge>{status}</Badge>
                </Flex>
              );
            },
          },
          {
            accessorKey: "linkedin",
            maxSize: 100,
            minSize: 100,
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconToggleRight color="gray" size={"0.9rem"} />
                <Text color="gray">Linkedin</Text>
              </Flex>
            ),

            enableResizing: true,
            cell: (cell) => {
              const { linkedin_url } = cell.row.original;

              return (
                <Flex align={"center"} gap={"xs"} py={"sm"} w={"100%"} h={"100%"}>
                  <Flex justify={"space-between"} w={"100%"}>
                    <Switch checked={linkedin_url && true} />
                  </Flex>
                </Flex>
              );
            },
          },
          {
            accessorKey: "email",
            maxSize: 100,
            minSize: 100,
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconToggleRight color="gray" size={"0.9rem"} />
                <Text color="gray">Email</Text>
              </Flex>
            ),

            enableResizing: true,
            cell: (cell) => {
              const { email } = cell.row.original;

              return (
                <Flex align={"center"} justify={"center"} gap={"xs"} py={"sm"} w={"100%"} h={"100%"}>
                  <Switch checked={email && true} />
                </Flex>
              );
            },
          },
        ]}
        styles={{
          dataCellContent: {
            marginBlock: "auto",
          },
        }}
      />
      <Paper mt={"xs"} withBorder p={"xs"} style={{ borderColor: "orange", backgroundColor: "#FEF0C769" }}>
        <Flex align={"center"} gap={5}>
          <IconInfoCircle color="orange" />
          <Text size={"sm"} fw={500} color="orange">
            {"Overwriting the prospect will also reset the prospect's status."}
          </Text>
        </Flex>
      </Paper>
      <Flex gap={"lg"} mt={"lg"}>
        <Button fullWidth variant="outline" color="gray">
          Nevermind
        </Button>
        <Button fullWidth>Go Ahead</Button>
      </Flex>
    </Stack>
  );
}
