import { userTokenState } from "@atoms/userAtoms";
import RichTextArea from "@common/library/RichTextArea";
import { API_URL } from "@constants/data";
import { Badge, Box, Button, Flex, Group, MultiSelect, Radio, Text, TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { ContextModalProps } from "@mantine/modals";
import { IconCalendar, IconX } from "@tabler/icons";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

export default function StrategyEditModal({
  innerProps,
  context,
  id,
}: ContextModalProps<{
  title: string;
  description: string;
  status: string;
  archetypes: number[];
  startDate: Date | null;
  endDate: Date | null;
  onSubmit: (title: string, description: string, archetypes: number[], status: string, startDate: Date | null, endDate: Date | null) => void;
}>) {
  const userToken = useRecoilValue(userTokenState);
  const [status, setStatus] = useState(innerProps.status);
  const [title, setTitle]: any = useState(innerProps.title);
  const [description, setDescription] = useState(innerProps.description);
  const [archetypes, setArchetypes]: any = useState(innerProps.archetypes); // Typo: setArchetype
  const [allArchetypes, setAllArchetypes] = useState([]);

  const [startDate, setStartDate] = useState<Date | null>(innerProps.startDate);
  const [endDate, setEndDate] = useState<Date | null>(innerProps.endDate);

  useEffect(() => {
    fetch(`${API_URL}/client/all_archetypes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setAllArchetypes(
          data.data.map((x: any) => {
            return {
              value: x.id,
              label: x.emoji + " " + x.archetype,
            };
          })
        );
      });
  }, [userToken]);

  return (
    <Box>
      <TextInput label="Strategy Name" defaultValue={innerProps.title} onChange={(event) => setTitle(event.currentTarget.value)} />
      {window.location.href.includes('selix') ? null : (
        <MultiSelect
          withinPortal
          label="Attach Campaigns"
          placeholder="Search campaigns"
          searchable
          data={allArchetypes}
          onChange={(value: any) => {
            setArchetypes(value);
          }}
          value={archetypes}
          mt={10}
        />
      )}
        <Flex gap={"md"} align="center" justify="center">
          <Box>
            <Text size={"sm"} fw={500}>
              Time Frame
            </Text>
            <Flex gap={"sm"}>
              <DateInput valueFormat="MM/DD/YYYY" rightSection={<IconCalendar size={"0.9rem"} color="gray" />} w={"100%"} value={startDate} onChange={setStartDate}/>
              <DateInput valueFormat="MM/DD/YYYY" rightSection={<IconCalendar size={"0.9rem"} color="gray" />} w={"100%"} value={endDate} onChange={setEndDate}/>
            </Flex>
          </Box>
          <Box>
            <Text mb="xs" size={"sm"} fw={500} mt={"sm"}>
              Status
            </Text>
            <Radio.Group mb="md" value={status} onChange={(value) => setStatus(value)} defaultValue={innerProps.status}>
            <Flex gap={20}>
              <Radio
                value="NOT_STARTED"
                label="Not Started"
                styles={{
                  label: {
                    color: "grey",
                    fontSize: "16px",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  },
                }}
              />
              <Radio
                value="IN_PROGRESS"
                label="In Progress"
                styles={{
                  label: {
                    color: "orange",
                    fontSize: "16px",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  },
                }}
              />
              <Radio
                value="FAILED"
                label="Failed"
                styles={{
                  label: {
                    color: "red",
                    fontSize: "16px",
                    fontWeight: 500,
                  },
                }}
              />
              <Radio
                value="SUCCESS"
                label="Success"
                styles={{
                  label: {
                    color: "green",
                    fontSize: "16px",
                    fontWeight: 500,
                  },
                }}
              />
            </Flex>
          </Radio.Group>
          </Box>
        </Flex>
      <Box>
        <Text fw={500} size={"sm"} mb={"8"}>
          Description
        </Text>
        <RichTextArea height={300} onChange={setDescription} value={innerProps.description} />
      </Box>
      <Flex gap={"xl"} mt={40}>
        <Button variant="outline" color="gray" fullWidth>
          Cancel
        </Button>
        <Button
          fullWidth
          onClick={() => {
            innerProps.onSubmit(title, description, archetypes, status, startDate, endDate);
            context.closeAll();
          }}
        >
          Save Strategy
        </Button>
      </Flex>
    </Box>
  );
}
