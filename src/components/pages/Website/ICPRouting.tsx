import { ActionIcon, Badge, Box, Button, Title, Flex, Paper, Select, Switch, Text, useMantineTheme } from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import { IconChevronLeft, IconChevronRight, IconCircleCheck, IconCircleX, IconLetterT, IconPencil, IconPlus, IconToggleRight } from "@tabler/icons";
import { DataGrid } from "mantine-data-grid";
import { useState } from "react";

export default function ICPRouting() {
  const theme = useMantineTheme();
  const [loading, setLoading] = useState(false);
  const [acPageSize, setAcPageSize] = useState("25");

  const [data, setData] = useState([
    {
      companyName: "Compeitition1",
      description: "This is a company that is 'competitive' with SellScale and is building AI products in the sales space.",
      routeTo: "competition segment",
      send_slack: true,
      status: true,
    },
    {
      companyName: "Compeitition1",
      description: "This is a company that is 'competitive' with SellScale and is building AI products in the sales space.",
      routeTo: "competition segment",
      send_slack: true,
      status: true,
    },
    {
      companyName: "Compeitition1",
      description: "This is a company that is 'competitive' with SellScale and is building AI products in the sales space.",
      routeTo: "competition segment",
      send_slack: true,
      status: true,
    },
    {
      companyName: "Compeitition1",
      description: "This is a company that is 'competitive' with SellScale and is building AI products in the sales space.",
      routeTo: "competition segment",
      send_slack: false,
      status: false,
    },
    {
      companyName: "Compeitition1",
      description: "This is a company that is 'competitive' with SellScale and is building AI products in the sales space.",
      routeTo: "competition segment",
      send_slack: true,
      status: false,
    },
  ]);

  return (
    <Paper withBorder radius={"sm"} p={"md"} mt={"md"}>
      <Flex justify={"space-between"}>
        <Box>
          <Text size={"md"} fw={600}>
            ICP Routing
          </Text>
          <Text size={"xs"} color="gray" fw={400}>
            Automatically categorize website visitors and score them. Based on scoring, send them to specific segments and trigger automations.
          </Text>
        </Box>
        <Button
          leftIcon={<IconPlus size={"1rem"} />}
          onClick={() =>
            openContextModal({
              modal: "createICProutingModal",
              title: (
                <Flex>
                  <Title order={3}>Create ICP Routing</Title>
                </Flex>
              ),
              innerProps: {},
              styles: {
                content: {
                  minWidth: "600px",
                },
              },
            })
          }
        >
          Create New
        </Button>
      </Flex>
      <DataGrid
        mt={"md"}
        data={data}
        highlightOnHover
        withPagination
        withSorting
        withColumnBorders
        withBorder
        sx={{
          cursor: "pointer",
          "& .mantine-10xyzsm>tbody>tr>td": {
            padding: "0px",
          },
          "& tr": {
            background: "white",
          },
        }}
        columns={[
          {
            accessorKey: "name",
            minSize: 400,
            maxSize: 500,
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconLetterT color="gray" size={"0.9rem"} />
                <Text color="gray">Name</Text>
              </Flex>
            ),
            cell: (cell) => {
              const { companyName, description } = cell.row.original;

              return (
                <Flex w={"100%"} h={"100%"} px={"sm"} align={"center"} justify={"start"}>
                  <Box>
                    <Text size={"sm"} fw={500}>
                      {companyName}
                    </Text>
                    <Text size={"xs"} color="gray">
                      {description}
                    </Text>
                  </Box>
                </Flex>
              );
            },
          },
          {
            accessorKey: "routes",
            minSize: 200,
            maxSize: 300,
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconLetterT color="gray" size={"0.9rem"} />
                <Text color="gray">Route To</Text>
              </Flex>
            ),

            cell: (cell) => {
              const { routeTo } = cell.row.original;

              return (
                <Flex align={"center"} justify={"center"} gap={"xs"} py={"lg"} w={"100%"} h={"100%"}>
                  <Flex justify={"center"} w={"100%"} align={"center"} gap={"md"}>
                    <Badge>{routeTo}</Badge>
                  </Flex>
                </Flex>
              );
            },
          },
          {
            accessorKey: "send_in_slack",
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconToggleRight color="gray" size={"0.9rem"} />
                <Text color="gray">Send in Slack</Text>
              </Flex>
            ),
            maxSize: 120,
            minSize: 120,
            enableResizing: true,
            cell: (cell) => {
              const { send_slack } = cell.row.original;

              return (
                <Flex align={"center"} justify={"center"} gap={"xs"} py={"lg"} w={"100%"} h={"100%"}>
                  <Flex justify={"center"} w={"100%"} align={"center"} gap={"md"}>
                    {send_slack ? <IconCircleCheck size={"1.8rem"} fill="green" color="white" /> : <IconCircleX size={"1.8rem"} fill="red" color="white" />}
                  </Flex>
                </Flex>
              );
            },
          },
          {
            accessorKey: "enable",
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconToggleRight color="gray" size={"0.9rem"} />
                <Text color="gray">Enabled</Text>
              </Flex>
            ),
            maxSize: 120,
            minSize: 120,
            enableResizing: true,
            cell: (cell) => {
              const { status } = cell.row.original;

              return (
                <Flex align={"center"} justify={"center"} gap={"xs"} py={"lg"} w={"100%"} h={"100%"}>
                  <Flex justify={"center"} w={"100%"} align={"center"} gap={"md"}>
                    <Switch defaultChecked={status} />
                  </Flex>
                </Flex>
              );
            },
          },
          {
            accessorKey: "action",
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconToggleRight color="gray" size={"0.9rem"} />
                <Text color="gray">Action</Text>
              </Flex>
            ),
            enableResizing: true,
            minSize: 100,
            cell: (cell) => {
              return (
                <Flex align={"center"} justify={"center"} gap={"xs"} py={"lg"} w={"100%"} h={"100%"}>
                  <Flex justify={"center"} w={"100%"} align={"center"} gap={"md"}>
                    <Button size="xs" radius={"xl"} color="yellow" variant="light" leftIcon={<IconPencil color="orange" size={"1rem"} />}>
                      Edit
                    </Button>
                  </Flex>
                </Flex>
              );
            },
          },
        ]}
        options={{
          enableFilters: true,
        }}
        loading={loading}
        components={{
          pagination: ({ table }) => (
            <Flex
              justify={"space-between"}
              align={"center"}
              px={"sm"}
              py={"1.25rem"}
              sx={(theme) => ({
                border: `1px solid ${theme.colors.gray[4]}`,
                borderTopWidth: 0,
              })}
            >
              <Select
                style={{ width: "150px" }}
                data={[
                  { label: "Show 25 rows", value: "25" },
                  { label: "Show 10 rows", value: "10" },
                  { label: "Show 5 rows", value: "5" },
                ]}
                value={acPageSize}
                onChange={(v) => {
                  setAcPageSize(v ?? "25");
                }}
              />
              <Flex align={"center"} gap={"sm"}>
                <Flex align={"center"}>
                  <Select
                    maw={100}
                    value={`${table.getState().pagination.pageIndex + 1}`}
                    data={new Array(table.getPageCount()).fill(0).map((i, idx) => ({
                      label: String(idx + 1),
                      value: String(idx + 1),
                    }))}
                    onChange={(v) => {
                      table.setPageIndex(Number(v) - 1);
                    }}
                  />
                  <Flex
                    sx={(theme) => ({
                      borderTop: `1px solid ${theme.colors.gray[4]}`,
                      borderRight: `1px solid ${theme.colors.gray[4]}`,
                      borderBottom: `1px solid ${theme.colors.gray[4]}`,
                      marginLeft: "-2px",
                      paddingLeft: "1rem",
                      paddingRight: "1rem",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "0.25rem",
                    })}
                    h={36}
                  >
                    <Text color="gray.5" fw={500} fz={14}>
                      of {table.getPageCount()} pages
                    </Text>
                  </Flex>
                  <ActionIcon
                    variant="default"
                    color="gray.4"
                    h={36}
                    disabled={table.getState().pagination.pageIndex === 0}
                    onClick={() => {
                      table.setPageIndex(table.getState().pagination.pageIndex - 1);
                    }}
                  >
                    <IconChevronLeft stroke={theme.colors.gray[4]} />
                  </ActionIcon>
                  <ActionIcon
                    variant="default"
                    color="gray.4"
                    h={36}
                    disabled={table.getState().pagination.pageIndex === table.getPageCount() - 1}
                    onClick={() => {
                      table.setPageIndex(table.getState().pagination.pageIndex + 1);
                    }}
                  >
                    <IconChevronRight stroke={theme.colors.gray[4]} />
                  </ActionIcon>
                </Flex>
              </Flex>
            </Flex>
          ),
        }}
        w={"100%"}
        pageSizes={[acPageSize]}
        styles={(theme) => ({
          thead: {
            height: "44px",
            backgroundColor: theme.colors.gray[0],
            "::after": {
              backgroundColor: "transparent",
            },
          },

          wrapper: {
            gap: 0,
          },
          scrollArea: {
            paddingBottom: 0,
            gap: 0,
          },

          dataCellContent: {
            width: "100%",
          },
        })}
      />
    </Paper>
  );
}
