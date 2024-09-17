import CustomSelect from "@common/persona/ICPFilter/CustomSelect";
import {
  Avatar,
  Box,
  Checkbox,
  Divider,
  Flex,
  Paper,
  Stack,
  Switch,
  Text,
  Title,
} from "@mantine/core";
import { IconBuilding, IconLetterT, IconMapPin } from "@tabler/icons";
import { IconUniverse } from "@tabler/icons-react";
import { DataGrid } from "mantine-data-grid";
import { useState } from "react";

export default function SelixIntelligence() {
  const [calendarsData, setCalendarsData] = useState([
    {
      status: true,
      avatar: "",
      name: "John Doe",
      job: "Marketing Head",
      company: "Alpha Tech",
      university: "University of Penn",
      city: "New York",
    },
    {
      status: true,
      avatar: "",
      name: "John Doe",
      job: "Director",
      company: "Botanica",
      university: "Stanford University",
      city: "New York",
    },
    {
      status: true,
      avatar: "",
      name: "John Doe",
      job: "Co-Founder",
      company: "Zetta Group",
      university: "Harward",
      city: "New York",
    },
    {
      status: true,
      avatar: "",
      name: "John Doe",
      job: "Sales Head",
      company: "Beta Force",
      university: "University of Penn",
      city: "New York",
    },
    {
      status: true,
      avatar: "",
      name: "John Doe",
      job: "Managing Head",
      company: "Wishhh",
      university: "University of Penn",
      city: "New York",
    },
  ]);

  const [newEvents, setNewEvents] = useState([
    "New Publication",
    "R&D Budget",
    "Hired new insights leader",
  ]);

  return (
    <Paper p={"md"} radius={"sm"} withBorder bg={"#fcfcfd"}>
      <Stack spacing={"sm"}>
        <Box>
          <Flex align={"center"} justify={"space-between"}>
            <Title order={3} mb={"0.25rem"}>
              Selix Intelligence
            </Title>
          </Flex>
          <Text size={"xs"} color="gray">
            Connect data sources to Selix to make smart and proactive outreach
            recommendations
          </Text>
        </Box>
        <Paper withBorder radius={"sm"} p={"sm"}>
          <Flex align={"center"} justify={"space-between"}>
            <Title order={4} mb={"0.25rem"}>
              CRM
            </Title>
            <Switch defaultChecked />
          </Flex>
          <Text size={"xs"} color="gray">
            Get recommendations based on champions, new account closed, and new
            opportunities.
          </Text>
        </Paper>
        <Paper withBorder radius={"sm"} p={"sm"}>
          <Flex align={"center"} justify={"space-between"}>
            <Title order={4} mb={"0.25rem"}>
              Calendars
            </Title>
            <Switch defaultChecked />
          </Flex>
          <Text size={"xs"} color="gray">
            Based on upcoming, external events. like conference or travels,
            determine new campaign ideas.
          </Text>
          <Stack spacing={"xs"} mt={"sm"}>
            {calendarsData.map((item, index) => {
              return (
                <Paper
                  withBorder
                  p={"xs"}
                  radius={"sm"}
                  key={index}
                  bg={"#fcfcfd"}
                >
                  <Flex gap={"sm"} align={"center"}>
                    <Checkbox defaultChecked={item.status} />
                    <Avatar radius={"xl"} size={"sm"} src={item.avatar} />
                    <Text
                      size={"sm"}
                      fw={500}
                      color={item.status ? "" : "green"}
                    >
                      {item.name}
                    </Text>
                    <Divider orientation="vertical" />
                    <Text size={"xs"} fw={500} color="gray">
                      {item.job}, {item.company}
                    </Text>
                  </Flex>
                </Paper>
              );
            })}
          </Stack>
        </Paper>
        <Paper withBorder radius={"sm"} p={"sm"}>
          <Flex align={"center"} justify={"space-between"}>
            <Title order={4} mb={"0.25rem"}>
              New Events
            </Title>
            <Switch defaultChecked />
          </Flex>
          <Text size={"xs"} color="gray" mb={"sm"}>
            Scour the news, daily. for net new events to generate new and timely
            campaign ideas
          </Text>
          <CustomSelect
            maxWidth="100%"
            color="green"
            value={newEvents}
            label="Keywords:"
            placeholder="Select options"
            setValue={setNewEvents}
            data={newEvents}
            setData={setNewEvents}
          />
        </Paper>
        <Paper withBorder radius={"sm"} p={"sm"}>
          <Flex align={"center"} justify={"space-between"}>
            <Title order={4} mb={"0.25rem"}>
              Conference Engine
            </Title>
            <Switch defaultChecked />
          </Flex>
          <Text size={"xs"} color="gray">
            Searches the web for upcoming conferences related to the ICPs that
            you target
          </Text>
        </Paper>
        <Paper withBorder radius={"sm"} p={"sm"}>
          <Flex align={"center"} justify={"space-between"}>
            <Title order={4} mb={"0.25rem"}>
              Social Engine
            </Title>
            <Switch defaultChecked />
          </Flex>
          <Text size={"xs"} color="gray">
            Based on your team's alumni network and location and past work
            history, finds relevant contacts to reach out to.
          </Text>
          <DataGrid
            data={calendarsData}
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
                  const { avatar, name }: any = cell.row.original;

                  return (
                    <Flex gap={"xs"} w={"100%"} h={"100%"} align={"center"}>
                      <Avatar src={avatar} size={"md"} radius={"xl"} />
                      <Text fw={500}>{name}</Text>
                    </Flex>
                  );
                },
              },
              {
                accessorKey: "company",
                header: () => (
                  <Flex align={"center"} gap={"3px"}>
                    <IconUniverse color="gray" size={"0.9rem"} />
                    <Text color="gray">University</Text>
                  </Flex>
                ),

                enableResizing: true,
                cell: (cell) => {
                  const { university } = cell.row.original;

                  return (
                    <Flex align={"center"} gap={"xs"} w={"100%"} h={"100%"}>
                      <Text fw={500}>{university}</Text>
                    </Flex>
                  );
                },
              },
              {
                accessorKey: "title",
                header: () => (
                  <Flex align={"center"} gap={"3px"}>
                    <IconBuilding color="gray" size={"0.9rem"} />
                    <Text color="gray">Company</Text>
                  </Flex>
                ),
                maxSize: 200,
                minSize: 200,
                cell: (cell) => {
                  const { company } = cell.row.original;

                  return (
                    <Flex gap={"xs"} w={"100%"} h={"100%"} align={"center"}>
                      <Text fw={500} lineClamp={2} maw={200}>
                        {company}
                      </Text>
                    </Flex>
                  );
                },
              },
              {
                accessorKey: "sdr",
                header: () => (
                  <Flex align={"center"} gap={"3px"}>
                    <IconMapPin color="gray" size={"0.9rem"} />
                    <Text color="gray">City</Text>
                  </Flex>
                ),

                enableResizing: true,
                cell: (cell) => {
                  const { city } = cell.row.original;

                  return (
                    <Flex align={"center"} gap={"xs"} w={"100%"} h={"100%"}>
                      <Text fw={500} lineClamp={2} maw={200}>
                        {city}
                      </Text>
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
        </Paper>
      </Stack>
    </Paper>
  );
}
