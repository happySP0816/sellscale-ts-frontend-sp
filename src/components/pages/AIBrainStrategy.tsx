import { Box, Flex, Text, Badge, Button, Select, ActionIcon, useMantineTheme, SimpleGrid, Paper, Title } from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import {
  IconBulb,
  IconChevronLeft,
  IconChevronRight,
  IconEye,
  IconLamp,
  IconLoader,
  IconPencil,
  IconPlus,
  IconPoint,
  IconTargetArrow,
  IconToggleLeft,
} from "@tabler/icons";
import { IconLighter } from "@tabler/icons-react";
import { DataGrid } from "mantine-data-grid";
import { useState } from "react";

export default function AIBrainStrategy() {
  const theme = useMantineTheme();
  const [udPageSize, setUdPageSize] = useState("25");

  const [strategies, setStrategies] = useState([
    {
      title: "Bay Area Campaign",
      goal: "Test out if Bay Area is working betterl select different...",
      tagged_campaigns: ["🥞 PTAL Campaign 1", "⛰ PTAL Campaign 2", "🏓 PTAL Campaign 3"],
      response: 5,
      demo: 2,
      status: "Failed",
    },
    {
      title: "Bay Area Campaign",
      goal: "Test out if Bay Area is working betterl select different...",
      tagged_campaigns: ["🥞 PTAL Campaign 1", "⛰ PTAL Campaign 2", "🏓 PTAL Campaign 3", "🐢 PTAL Campaign 4"],
      response: 5,
      demo: 2,
      status: "Failed",
    },
    {
      title: "Bay Area Campaign",
      goal: "Test out if Bay Area is working betterl select different...",
      tagged_campaigns: ["🥞 PTAL Campaign 1", "⛰ PTAL Campaign 2", "🏓 PTAL Campaign 3"],
      response: 5,
      demo: 2,
      status: "Failed",
    },
    {
      title: "Bay Area Campaign",
      goal: "Test out if Bay Area is working betterl select different...",
      tagged_campaigns: ["🥞 PTAL Campaign 1", "⛰ PTAL Campaign 2", "🏓 PTAL Campaign 3", "🐢 PTAL Campaign 4"],
      response: 5,
      demo: 2,
      status: "Success",
    },
  ]);

  return (
    <Box>
      <Flex align={"center"} justify={"space-between"}>
        <Title order={3}>SellScale Initiated Campaigns (New Strategies)</Title>
        <Button
          leftIcon={<IconPlus size={"0.9rem"} />}
          onClick={() => {
            openContextModal({
              modal: "createStrategy",
              title: (
                <Flex align={"center"} gap={"sm"}>
                  <IconBulb color="#228be6" size={"1.6rem"} />
                  <Title order={2}>Create Strategy</Title>
                </Flex>
              ),
              innerProps: {},
            });
          }}
        >
          New Strategy
        </Button>
      </Flex>
      <Paper>
        <DataGrid
          data={strategies}
          highlightOnHover
          mt={"sm"}
          withPagination
          withSorting
          withColumnBorders
          withBorder
          sx={{
            cursor: "pointer",
            "& tr": {
              background: "white",
            },
          }}
          columns={[
            {
              accessorKey: "strategy_title",
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <IconLamp color="gray" size={"0.9rem"} />
                  <Text color="gray">Strategy Title</Text>
                </Flex>
              ),
              minSize: 300,
              maxSize: 400,
              cell: (cell) => {
                const { title, goal } = cell.row.original;

                return (
                  <Flex gap={"xs"} w={"100%"} h={"100%"} align={"center"}>
                    <Flex align={"center"} gap={"sm"}>
                      <Box>
                        <Text size={"sm"} fw={700}>
                          {title}
                        </Text>
                        <Text size={"sm"} fw={500} mt={6}>
                          <span className=" font-semibold">Goal:</span> {goal}
                        </Text>
                      </Box>
                    </Flex>
                  </Flex>
                );
              },
            },
            {
              accessorKey: "tagged_campaigns",
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <IconTargetArrow color="gray" size={"0.9rem"} />
                  <Text color="gray">Tagged Campaigns</Text>
                </Flex>
              ),
              cell: (cell) => {
                const { tagged_campaigns } = cell.row.original;

                return (
                  <Flex w={"100%"} h={"100%"} align={"center"}>
                    <SimpleGrid cols={2} verticalSpacing={"xs"}>
                      {tagged_campaigns.map((item, index) => {
                        return (
                          <Text lineClamp={1} fw={600} key={index} className="">
                            {item}
                          </Text>
                        );
                      })}
                    </SimpleGrid>
                  </Flex>
                );
              },
            },
            {
              accessorKey: "cumulative_analysis",
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <IconLighter color="gray" size={"0.9rem"} />
                  <Text color="gray">Cumulative Analysis</Text>
                </Flex>
              ),
              maxSize: 210,
              enableResizing: true,
              cell: (cell) => {
                const { response, demo } = cell.row.original;

                return (
                  <Flex align={"center"} gap={"xs"} py={"sm"} w={"100%"} h={"100%"}>
                    <Text color="green" size={"xs"} fw={500}>
                      <span className=" font-bold">{response}</span> (+) Responses
                    </Text>
                    <IconPoint size={"1.2rem"} fill="gray" color="white" />
                    <Text color="grape" size={"xs"} fw={500}>
                      <span className=" font-bold">{demo}</span> Demos
                    </Text>
                  </Flex>
                );
              },
            },
            {
              accessorKey: "status",
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <Flex>
                    <IconLoader color="gray" size={"1.2rem"} />
                  </Flex>
                  <Text color="gray">Status</Text>
                </Flex>
              ),
              maxSize: 120,
              enableResizing: true,
              cell: (cell) => {
                const { status } = cell.row.original;

                return (
                  <Flex align={"center"} justify={"center"} gap={"xs"} py={"sm"} w={"100%"} h={"100%"}>
                    <Badge color={status === "Failed" ? "red" : status === "Success" ? "green" : "orange"}>{status}</Badge>
                  </Flex>
                );
              },
            },
            {
              accessorKey: "action",
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <IconToggleLeft color="gray" size={"0.9rem"} />
                  <Text color="gray">Action</Text>
                </Flex>
              ),
              maxSize: 100,
              enableResizing: true,
              cell: (cell) => {
                return (
                  <Flex align={"center"} justify={"center"} gap={"xs"} py={"sm"} w={"100%"} h={"100%"}>
                    <ActionIcon
                      size={"sm"}
                      radius={"xl"}
                      variant="light"
                      color="blue"
                      onClick={() => {
                        openContextModal({
                          modal: "previewStrategy",
                          title: (
                            <Flex align={"center"} gap={"sm"}>
                              <IconBulb color="#228be6" size={"1.6rem"} />
                              <Title order={2}>Preview Strategy</Title>
                            </Flex>
                          ),
                          innerProps: {
                            strategies: cell.row.original,
                          },
                        });
                      }}
                    >
                      <IconEye color="#228be6" size={"0.9rem"} />
                    </ActionIcon>
                    <ActionIcon
                      size={"sm"}
                      radius={"xl"}
                      variant="light"
                      color="orange"
                      onClick={() => {
                        openContextModal({
                          modal: "editStrategy",
                          title: (
                            <Flex align={"center"} gap={"sm"}>
                              <IconBulb color="#228be6" size={"1.6rem"} />
                              <Title order={2}>Edit Strategy</Title>
                            </Flex>
                          ),
                          innerProps: {
                            strategies: cell.row.original,
                          },
                        });
                      }}
                    >
                      <IconPencil color="orange" size={"0.9rem"} />
                    </ActionIcon>
                  </Flex>
                );
              },
            },
          ]}
          options={{
            enableFilters: true,
          }}
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
                  value={udPageSize}
                  onChange={(v) => {
                    setUdPageSize(v ?? "25");
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
          pageSizes={[udPageSize]}
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
            td: {
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            },
          })}
        />
      </Paper>
    </Box>
  );
}
