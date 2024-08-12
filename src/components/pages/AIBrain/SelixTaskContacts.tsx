import { ActionIcon, Avatar, Badge, Box, Button, Flex, Paper, Select, Text, useMantineTheme } from "@mantine/core";
import { IconChevronLeft, IconChevronRight, IconDownload, IconExternalLink, IconLetterT, IconPlus, IconTrash } from "@tabler/icons";
import { DataGrid } from "mantine-data-grid";
import { useState } from "react";

export default function SelixTaskContacts() {
  const theme = useMantineTheme();
  const [loading, setLoading] = useState(false);
  const [udPageSize, setUdPageSize] = useState("25");
  const data = [
    {
      name: "John Smith",
      tilte: "Senior Sales Manager",
      company: "AlphaCorp Inc.",
      linkedin: "https://www.linkedin.com/in/johnsmith",
      email: "john.smith@alphacorp.com",
    },
    {
      name: "Emily Johnson",
      tilte: "Marketing Director",
      company: "Beta Enterprises",
      linkedin: "https://www.linkedin.com/in/emilyjohnson",
      email: "emily.johnson@betacorporation.com",
    },
    {
      name: "Michael Brown",
      tilte: "Chief Technology Officer",
      company: "Gamma Solutions",
      linkedin: "https://www.linkedin.com/in/michaelbrown",
      email: "michael.brown@gammasolutions.com",
    },
    {
      name: "Sarah Davis",
      tilte: "Human Resources Manager",
      company: "Delta ",
      linkedin: "https://www.linkedin.com/in/sarahdavis",
      email: "sarah.davis@deltaenterprises.com",
    },
    {
      name: "Emily Johnson",
      tilte: "Marketing Director",
      company: "Beta Enterprises",
      linkedin: "https://www.linkedin.com/in/emilyjohnson",
      email: "emily.johnson@betacorporation.com",
    },
    {
      name: "Michael Brown",
      tilte: "Chief Technology Officer",
      company: "Gamma Solutions",
      linkedin: "https://www.linkedin.com/in/michaelbrown",
      email: "michael.brown@gammasolutions.com",
    },
  ];
  return (
    <Box p={"sm"}>
      <Flex justify={"space-between"}>
        <Flex align={"center"} gap={"sm"}>
          <Text size={"sm"} fw={600}>
            {87} contacts found
          </Text>
          <Paper withBorder radius={"xs"} px={"xs"} py={2}>
            <Text size={"sm"} fw={500} color="gray">
              Pulled from <span className="text-[#228be6]">{"MMachineCon.com"}</span>
            </Text>
          </Paper>
        </Flex>
        <Flex gap={"xs"} align={"center"}>
          <Button size="10" variant="outline" color="gray" px={"sm"} py={4} leftIcon={<IconTrash size={"1rem"} color={"gray"} />} radius={"xl"}>
            Delete
          </Button>
          <Button size="10" px={"sm"} py={4} leftIcon={<IconPlus size={"1rem"} color="white" />} radius={"xl"}>
            Add
          </Button>
          <Button size="10" px={"sm"} py={4} leftIcon={<IconDownload size={"1rem"} color="white" />} radius={"xl"} color="green">
            Download CSV
          </Button>
        </Flex>
      </Flex>
      <Box mt={"sm"}>
        <DataGrid
          data={data}
          highlightOnHover
          withPagination
          withSorting
          withRowSelection
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
              accessorKey: "full_name",
              minSize: 180,
              maxSize: 180,
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <IconLetterT color="gray" size={"0.9rem"} />
                  <Text color="gray">Full Name</Text>
                </Flex>
              ),
              cell: (cell) => {
                const { name } = cell.row.original;

                return (
                  <Flex gap={"xs"} w={"100%"} h={"100%"} align={"center"}>
                    <Avatar size={"sm"} radius={"xl"} src={""} />
                    <Text size={"sm"} fw={500} color="gray">
                      {name}
                    </Text>
                  </Flex>
                );
              },
            },
            {
              accessorKey: "title",
              minSize: 230,
              maxSize: 400,
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <IconLetterT color="gray" size={"0.9rem"} />
                  <Text color="gray">Title</Text>
                </Flex>
              ),
              cell: (cell) => {
                const { tilte } = cell.row.original;

                return (
                  <Flex w={"100%"} h={"100%"} align={"center"}>
                    <Text fw={500} color="gray" lineClamp={1}>
                      {tilte}
                    </Text>
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
              enableResizing: true,
              cell: (cell) => {
                const { company } = cell.row.original;

                return (
                  <Flex align={"center"} gap={"xs"} w={"100%"} h={"100%"}>
                    <Text fw={500} color="gray" lineClamp={1}>
                      {company}
                    </Text>
                  </Flex>
                );
              },
            },
            {
              accessorKey: "linkedin",
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <IconLetterT color="gray" size={"0.9rem"} />
                  <Text color="gray">Linkedin</Text>
                </Flex>
              ),
              maxSize: 100,
              enableResizing: true,
              cell: (cell) => {
                const { linkedin } = cell.row.original;

                return (
                  <Flex align={"center"} gap={"xs"} w={"100%"} h={"100%"}>
                    <Badge variant="filled" rightSection={<IconExternalLink size={"1rem"} className="mt-1" />}>
                      Visit
                    </Badge>
                  </Flex>
                );
              },
            },
            {
              accessorKey: "email",
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <IconLetterT color="gray" size={"0.9rem"} />
                  <Text color="gray">Email</Text>
                </Flex>
              ),
              minSize: 200,
              maxSize: 200,
              enableResizing: true,
              cell: (cell) => {
                const { email } = cell.row.original;

                return (
                  <Flex align={"center"} gap={"xs"} w={"100%"} h={"100%"}>
                    <Text underline color="#228be6">
                      {email}
                    </Text>
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
          })}
        />
      </Box>
      <Flex mt={"md"} gap={"sm"}>
        <Button variant="default" fullWidth>
          Filter Contacts
        </Button>
        <Button fullWidth>Looks good</Button>
      </Flex>
    </Box>
  );
}
