import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import { ActionIcon, Badge, Box, Button, Title, Flex, Paper, Select, Switch, Text, useMantineTheme, TextInput, Stack, Divider } from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import {
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconCircleX,
  IconLetterT,
  IconPencil,
  IconPlus,
  IconPoint,
  IconSearch,
  IconToggleRight,
} from "@tabler/icons";
import { IconUserSquare } from "@tabler/icons-react";
import { DataGrid } from "mantine-data-grid";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { Bar } from "react-chartjs-2";

export default function CRMContactFilter() {
  const theme = useMantineTheme();
  const [loading, setLoading] = useState(false);
  const [acPageSize, setAcPageSize] = useState("25");

  const userToken = useRecoilValue(userTokenState);

  const [data, setData] = useState([]);

  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    fetchCRMContacts();
  }, []);

  const fetchCRMContacts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/merge_crm/contacts`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      const data = await response.json();
      setData(data.data.contacts);
      setFilteredData(data.data.contacts);
      console.log("data is", data.data);
    } catch (error) {
      console.error("Error fetching CRM contacts:", error);
    } finally {
      setLoading(false);
    }
  };
  const Chartdata = {
    labels: ["15 Jul", "16 Jul", "17 Jul", "18 Jul", "19 Jul", "20 Jul", "21 Jul", "22 Jul"],
    datasets: [
      {
        label: "Leads",
        data: [300, 200, 156, 40, 20, 104, 302, 44],
        fill: false,
        borderColor: "#BE4BDB",
        backgroundColor: "#BE4BDB",
        width: 4,
        borderDash: [5, 5],
      },
      {
        label: "Contacts",
        data: [400, 210, 56, 140, 203, 294, 32, 39],
        fill: false,
        borderColor: "#228BE6",
        backgroundColor: "#228BE6",
        width: 4,
        borderDash: [5, 5],
      },
      {
        label: "Accounts",
        data: [60, 100, 16, 40, 30, 94, 102, 14],
        fill: false,
        borderColor: "#40C057",
        backgroundColor: "#40C057",
        width: 4,
        borderDash: [5, 5],
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
    scales: {
      x: {
        grid: {
          borderDash: [5, 5],
        },
      },
      y: {
        type: "linear",
      },
    },
  };

  return (
    <Box p={"sm"}>
      <Flex gap={"md"}>
        <Paper withBorder radius={"sm"} p={"lg"} w={"40%"}>
          <Text size={"lg"} fw={600}>
            Contacts prevented being outreached needing review
            <br /> <span className="text-gray-300">(found in the CRM)</span>
          </Text>
          <Box
            mt={"md"}
            pos={"relative"}
            sx={{
              overflow: "hidden",
              width: "100%",
              aspectRatio: "2/1",
            }}
          >
            <Box
              pos={"absolute"}
              sx={(theme) => ({
                top: 0,
                left: 0,
                width: "100%",
                aspectRatio: "1/1",
                borderRadius: "50%",
                border: `10px solid ${theme.colors.grape[0]}`,
                borderBottomColor: theme.colors.grape[theme.fn.primaryShade()],
                borderRightColor: theme.colors.grape[theme.fn.primaryShade()],
                transform: `rotate(${45 + 60 * 1.8}deg)`,
              })}
            >
              <div
                className="w-6 h-6 rounded-full border-gray border-red-100 bg-white p-[7px] absolute"
                style={{ left: `calc(${Math.sqrt(0.02) * 100}% - 15px)`, bottom: `calc(${Math.sqrt(0.02) * 100}% - 15px)` }}
              >
                <div className="w-full h-full rounded-full bg-pink-500"></div>
              </div>
            </Box>
            <Box
              pos={"absolute"}
              sx={(theme) => ({
                width: "80%",
                aspectRatio: "1/1",
                borderRadius: "50%",
                border: `10px solid ${theme.colors.blue[0]}`,
                borderBottomColor: theme.colors.blue[theme.fn.primaryShade()],
                borderRightColor: theme.colors.blue[theme.fn.primaryShade()],
                transform: `rotate(${45 + 45 * 1.8}deg)`,
                left: "10%",
                top: "20%",
              })}
            >
              <div
                className="w-6 h-6 rounded-full border-gray border-red-100 bg-white p-[7px] absolute"
                style={{ left: `calc(${Math.sqrt(0.02) * 100}% - 15px)`, bottom: `calc(${Math.sqrt(0.02) * 100}% - 15px)` }}
              >
                <div className="w-full h-full rounded-full bg-pink-500"></div>
              </div>
            </Box>
            <Box
              pos={"absolute"}
              sx={(theme) => ({
                width: "60%",
                aspectRatio: "1/1",
                borderRadius: "50%",
                border: `10px solid ${theme.colors.green[0]}`,
                borderBottomColor: theme.colors.green[theme.fn.primaryShade()],
                borderRightColor: theme.colors.green[theme.fn.primaryShade()],
                transform: `rotate(${45 + 30 * 1.8}deg)`,
                left: "20%",
                top: "40%",
              })}
            >
              <div
                className="w-6 h-6 rounded-full border-gray border-red-100 bg-white p-[7px] absolute"
                style={{ left: `calc(${Math.sqrt(0.02) * 100}% - 15px)`, bottom: `calc(${Math.sqrt(0.02) * 100}% - 15px)` }}
              >
                <div className="w-full h-full rounded-full bg-pink-500"></div>
              </div>
            </Box>
          </Box>
          <Box mt={"sm"}>
            <Flex align={"center"} w={"100%"} gap={"sm"}>
              <Text className="flex items-center" color="gray" fw={500} size={"sm"}>
                <IconPoint fill="#be4bdb" color="white" size={"2rem"} className="ml-[-10px]" />
                Leads:
              </Text>
              <Divider variant="dashed" w={"100%"} />
              <Text size={"sm"} fw={700}>
                {4.8}%
              </Text>
            </Flex>
            <Flex align={"center"} w={"100%"} gap={"sm"}>
              <Text className="flex items-center" color="gray" fw={500} size={"sm"}>
                <IconPoint fill="#228be6" color="white" size={"2rem"} className="ml-[-10px]" />
                Contacts:
              </Text>
              <Divider variant="dashed" w={"100%"} />
              <Text size={"sm"} fw={700}>
                {1.4}%
              </Text>
            </Flex>
            <Flex align={"center"} w={"100%"} gap={5}>
              <Text className="flex items-center" color="gray" fw={500} size={"sm"}>
                <IconPoint fill="#40c057" color="white" size={"2rem"} className="ml-[-10px]" />
                Accounts:
              </Text>
              <Divider variant="dashed" w={"100%"} />
              <Text size={"sm"} fw={700}>
                {4.8}%
              </Text>
            </Flex>
          </Box>
        </Paper>
        <Paper withBorder radius={"sm"} p={"lg"} w={"60%"}>
          <Text size={"lg"} fw={600}>
            How many recently sourced were duplicates
          </Text>
          <Box h={320} mt={"md"}>
            <Bar options={options} data={Chartdata} />
          </Box>
        </Paper>
      </Flex>
      <Paper withBorder radius={"sm"} p={"md"} mt={"sm"}>
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
            {data.length} contacts found
          </Button>
        </Flex>
        <TextInput
          w={350}
          mt={"sm"}
          placeholder="Search by company or name"
          rightSection={<IconSearch color="gray" size={"1rem"} />}
          onChange={(event) => {
            const searchValue = event.currentTarget.value.toLowerCase();
            setFilteredData(
              data.filter(
                (contact) =>
                  (contact as any).company?.toLowerCase().includes(searchValue) ||
                  (contact as any).first_name?.toLowerCase().includes(searchValue) ||
                  (contact as any).last_name?.toLowerCase().includes(searchValue)
              )
            );
          }}
        />
        <DataGrid
          mt={"md"}
          data={filteredData}
          highlightOnHover
          withPagination
          withSorting
          withColumnBorders
          withBorder
          sx={{
            cursor: "pointer",
            "& .mantine-10xyzsm>tbody>tr>td": {
              padding: "10px", // Increased padding for better readability
            },
            "& tr": {
              background: "white",
            },
            "& .mantine-10xyzsm>tbody>tr>td>div": {
              fontSize: "1.1rem", // Increased font size for better readability
            },
          }}
          columns={[
            {
              accessorKey: "first_name",
              minSize: 150,
              maxSize: 200,
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <IconLetterT color="gray" size={"0.9rem"} />
                  <Text color="gray">First Name</Text>
                </Flex>
              ),
              cell: (cell) => {
                const { first_name } = cell.row.original;

                return (
                  <Flex w={"100%"} h={"100%"} px={"sm"} align={"center"} justify={"start"}>
                    <Box>
                      <Text size={"sm"} fw={500}>
                        {first_name}
                      </Text>
                    </Box>
                  </Flex>
                );
              },
            },
            {
              accessorKey: "last_name",
              minSize: 150,
              maxSize: 200,
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <IconLetterT color="gray" size={"0.9rem"} />
                  <Text color="gray">Last Name</Text>
                </Flex>
              ),
              cell: (cell) => {
                const { last_name } = cell.row.original;

                return (
                  <Flex w={"100%"} h={"100%"} px={"sm"} align={"center"} justify={"start"}>
                    <Box>
                      <Text size={"sm"} fw={500}>
                        {last_name}
                      </Text>
                    </Box>
                  </Flex>
                );
              },
            },
            {
              accessorKey: "company",
              minSize: 200,
              maxSize: 300,
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
              accessorKey: "email_addresses",
              minSize: 300,
              maxSize: 400,
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <IconLetterT color="gray" size={"0.9rem"} />
                  <Text color="gray">Email Addresses</Text>
                </Flex>
              ),
              cell: (cell) => {
                const { email_addresses } = cell.row.original;

                return (
                  <Flex w={"100%"} h={"100%"} px={"sm"} align={"center"} justify={"start"}>
                    <Box>
                      {Array.isArray(email_addresses) &&
                        (email_addresses as string[]).map((email, index) => (
                          <Text key={index} size={"sm"} fw={500}>
                            {email}
                          </Text>
                        ))}
                    </Box>
                  </Flex>
                );
              },
            },
            {
              accessorKey: "active",
              maxSize: 140,
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <Text color="gray">Don't Contact</Text>
                </Flex>
              ),
              cell: (cell) => {
                const { do_not_contact } = cell.row.original;

                return (
                  <Flex align={"center"} justify={"center"} w={"100%"} h={"100%"}>
                    <Switch
                      checked={do_not_contact}
                      onChange={async (event) => {
                        setFilteredData((prevData: any) =>
                          prevData.map((item: any) => ((item as any).id === (cell.row.original as any).id ? { ...item, do_not_contact: isChecked } : item))
                        );
                        const isChecked = event.currentTarget.checked;
                        try {
                          const response = await fetch(`${API_URL}/merge_crm/dnc`, {
                            method: "POST",
                            headers: {
                              Authorization: `Bearer ${userToken}`,
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ active: isChecked, contact_id: (cell.row.original as any).id }),
                          });
                          if (!response.ok) {
                            throw new Error("Network response was not ok");
                          }
                          const result = await response.json();
                          console.log("Switch update result:", result);
                        } catch (error) {
                          console.error("Error updating switch state:", error);
                        }
                      }}
                    />
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
    </Box>
  );
}
