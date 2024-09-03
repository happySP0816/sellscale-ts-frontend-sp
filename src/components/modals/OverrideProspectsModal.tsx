import { Avatar, Badge, Box, Button, Flex, Paper, Stack, Text } from "@mantine/core";
import { IconClock, IconInfoCircle, IconLetterT, IconLoader, IconTargetArrow, IconUser } from "@tabler/icons";
import { DataGrid } from "mantine-data-grid";

export default function OverrideProspectsModal() {
  const data = [
    {
      avatar: "",
      name: "Etika Srivastava",
      job: "Talent Acquisition Recruiter",
      company: "HCLTech",
      sdr: "Ishan Sharma",
      segment: null,
      campaign: "Physician Outreach S1",
      status: "prospect",
    },
  ];
  return (
    <Stack spacing={"sm"}>
      <Text fw={400} color="gray" size={"sm"}>
        Ready to Upload? <span className="font-semibold text-black">We have found some prospects that are already to your prospect database.</span>
        Please check the prospects that you want to overwrite and move to your new segment/campaign.
      </Text>
      <DataGrid
        data={data}
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
            maxSize: 320,
            minSize: 320,
            cell: (cell) => {
              const { avatar, job, company, name } = cell.row.original;

              return (
                <Flex gap={"xs"} w={"100%"} h={"100%"} align={"center"}>
                  <Avatar src={avatar} size={"md"} radius={"xl"} />
                  <Box>
                    <Text fw={500}>{name}</Text>
                    <Flex>
                      <Text size={"xs"} color="gray" fw={500}>
                        {job} <span className="font-semibold text-[14px]">@{company}</span>
                      </Text>
                    </Flex>
                  </Box>
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
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconClock color="gray" size={"0.9rem"} />
                <Text color="gray">Segment</Text>
              </Flex>
            ),

            enableResizing: true,
            cell: (cell) => {
              const { segment } = cell.row.original;

              return (
                <Flex align={"center"} gap={"xs"} py={"sm"} w={"100%"} h={"100%"}>
                  <Text fw={500}>{segment ? segment : "None"}</Text>
                </Flex>
              );
            },
          },
          {
            accessorKey: "segment",
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconTargetArrow color="gray" size={"0.9rem"} />
                <Text color="gray">Campaign</Text>
              </Flex>
            ),

            enableResizing: true,
            cell: (cell) => {
              const { campaign } = cell.row.original;

              return (
                <Flex align={"center"} gap={"xs"} py={"sm"} w={"100%"} h={"100%"}>
                  <Text fw={500}>{campaign}</Text>
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
