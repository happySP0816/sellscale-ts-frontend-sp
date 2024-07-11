import { ActionIcon, Badge, Box, Button, Title, Flex, Paper, Select, Switch, Text, useMantineTheme, TextInput } from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import { IconChevronLeft, IconChevronRight, IconCircleCheck, IconCircleX, IconLetterT, IconPencil, IconPlus, IconSearch, IconToggleRight } from "@tabler/icons";
import { IconUserSquare } from "@tabler/icons-react";
import { DataGrid } from "mantine-data-grid";
import { useState } from "react";

export default function CRMContactFilter() {
  const theme = useMantineTheme();
  const [loading, setLoading] = useState(false);
  const [acPageSize, setAcPageSize] = useState("25");

  const [data, setData] = useState([
    {
      name: "Johnny Smith",
      company: "Carta",
      filter: true,
    },
    {
      name: "Rebecca J",
      company: "Nvidia",
      filter: false,
    },
    {
      name: "Sonya L",
      company: "Amazon",
      filter: false,
    },
    {
      name: "Amanda C",
      company: "Athelas",
      filter: true,
    },
    {
      name: "Manuella P",
      company: "Apple",
      filter: true,
    },
    {
      name: "Gloria J",
      company: "Retool",
      filter: false,
    },
    {
      name: "Parker C",
      company: "Jenni",
      filter: true,
    },
    {
      name: "Robert D",
      company: "SellScale",
      filter: true,
    },
    {
      name: "Amanda C",
      company: "Retool",
      filter: true,
    },
  ]);

  return (
    <Paper withBorder radius={"sm"} p={"md"} mt={"md"}>
      <Flex justify={"space-between"}>
        <Box>
          <Text size={"md"} fw={600}>
            CRM Contact Filter
          </Text>
          <Text size={"xs"} color="gray" fw={400}>
            Filter out contacts that are in your CRM automatically.
          </Text>
        </Box>
        <Button variant="light" leftIcon={<IconUserSquare size={"1rem"} />} color="green">
          {8291} contacts found
        </Button>
      </Flex>
      <TextInput w={350} mt={"sm"} placeholder="Search by company or name" rightSection={<IconSearch color="gray" size={"1rem"} />} />
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
            minSize: 300,
            maxSize: 400,
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconLetterT color="gray" size={"0.9rem"} />
                <Text color="gray">Name</Text>
              </Flex>
            ),
            cell: (cell) => {
              const { name } = cell.row.original;

              return (
                <Flex w={"100%"} h={"100%"} px={"sm"} align={"center"} justify={"start"}>
                  <Box>
                    <Text size={"sm"} fw={500}>
                      {name}
                    </Text>
                  </Box>
                </Flex>
              );
            },
          },
          {
            accessorKey: "company",
            minSize: 200,
            maxSize: 200,
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconLetterT color="gray" size={"0.9rem"} />
                <Text color="gray">Company</Text>
              </Flex>
            ),

            cell: (cell) => {
              const { company } = cell.row.original;

              return (
                <Flex align={"center"} justify={"center"} gap={"xs"} w={"100%"} h={"100%"}>
                  <Flex justify={"start"} w={"100%"} align={"center"} gap={"md"} ml={"md"}>
                    <Text size={"sm"} fw={500}>
                      {company}
                    </Text>
                  </Flex>
                </Flex>
              );
            },
          },
          {
            accessorKey: "filter",
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconToggleRight color="gray" size={"0.9rem"} />
                <Text color="gray">Filter</Text>
              </Flex>
            ),
            maxSize: 200,
            minSize: 200,
            enableResizing: true,
            cell: (cell) => {
              const { filter } = cell.row.original;

              return (
                <Flex align={"center"} justify={"center"} gap={"xs"} py={"sm"} w={"100%"} h={"100%"}>
                  <Flex justify={"start"} w={"100%"} align={"center"} gap={"md"} ml={"md"}>
                    <Switch defaultChecked={filter} />
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
