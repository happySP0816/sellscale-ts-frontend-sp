import { userTokenState } from "@atoms/userAtoms";
import RichTextArea from "@common/library/RichTextArea";
import { API_URL } from "@constants/data";
import { Box, Button, Flex, MultiSelect, Paper, Select, Text, TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { ContextModalProps } from "@mantine/modals";
import { IconCalendar } from "@tabler/icons";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

export default function StrategyCreateModal({
  innerProps,
  context,
  id,
}: ContextModalProps<{
  onSubmit: (title: string, description: string, archetypes: number[], startDate: Date | null, endDate: Date | null) => void;
}>) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [archetypes, setArchetypes]: any = useState([]);
  const [loading, setLoading] = useState(false);

  const [allArchetypes, setAllArchetypes] = useState([]);
  const userToken = useRecoilValue(userTokenState);

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
    <Paper>
      <TextInput label="Strategy Name" placeholder="Eg. Product managers in chicago" value={title} onChange={(event) => setTitle(event.currentTarget.value)} />
      <Text mt="xs">Description</Text>
      <RichTextArea
        onChange={(value) => {
          setDescription(value);
          console.log(value);
        }}
      />
      <MultiSelect
        withinPortal
        label="Attach Campaigns"
        placeholder="Search campaigns"
        searchable
        data={allArchetypes}
        onChange={(value) => {
          setArchetypes(value);
        }}
        mt={20}
      />
      <Box>
        <Text size={"sm"} fw={500} mt={"sm"}>
          Time Frame
        </Text>
        <Flex gap={"md"}>
          <DateInput valueFormat="DD/MM/YYYY" rightSection={<IconCalendar size={"0.9rem"} color="gray" />} w={"100%"} onChange={setStartDate}/>
          <DateInput valueFormat="DD/MM/YYYY" rightSection={<IconCalendar size={"0.9rem"} color="gray" />} w={"100%"} onChange={setEndDate}/>
        </Flex>
      </Box>
      <Flex gap={"xl"} mt={40}>
        <Button variant="outline" color="gray" fullWidth>
          Cancel
        </Button>
        <Button
          fullWidth
          loading={loading}
          disabled={loading || !title || !description}
          onClick={() => {
            setLoading(true);
            innerProps.onSubmit(title, description, archetypes, startDate, endDate);
            context.closeAll();
            setLoading(false);
          }}
        >
          Create Strategy
        </Button>
      </Flex>
    </Paper>
  );
}
