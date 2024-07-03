import { userTokenState } from "@atoms/userAtoms";
import RichTextArea from "@common/library/RichTextArea";
import { API_URL } from "@constants/data";
import {
  Badge,
  Box,
  Button,
  Flex,
  Group,
  MultiSelect,
  Radio,
  Text,
  TextInput,
} from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { IconX } from "@tabler/icons";
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
  onSubmit: (
    title: string,
    description: string,
    archetypes: number[],
    status: string
  ) => void;
}>) {
  const userToken = useRecoilValue(userTokenState);
  const [status, setStatus] = useState(innerProps.status);
  const [title, setTitle]: any = useState(innerProps.title);
  const [description, setDescription] = useState(innerProps.description);
  const [archetypes, setArchetypes]: any = useState(innerProps.archetypes); // Typo: setArchetype
  const [allArchetypes, setAllArchetypes] = useState([]);

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
      <TextInput
        label="Strategy Name"
        defaultValue={innerProps.title}
        onChange={setTitle}
      />
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
        mt={20}
      />
      <Radio.Group
        label="Status"
        mt={"md"}
        value={status}
        onChange={(value) => setStatus(value)}
        defaultValue={innerProps.status}
      >
        <Flex mt="8" gap={70}>
          <Radio
            value="IN_PROGRESS"
            label="In Progress"
            styles={{
              label: {
                color: "orange",
                fontSize: "16px",
                fontWeight: 500,
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
      <Box mt={20}>
        <Text fw={500} size={"sm"} mb={"8"}>
          Description
        </Text>
        <RichTextArea
          height={200}
          onChange={setDescription}
          value={innerProps.description}
        />
      </Box>
      <Flex gap={"xl"} mt={40}>
        <Button variant="outline" color="gray" fullWidth>
          Cancel
        </Button>
        <Button
          fullWidth
          onClick={() => {
            innerProps.onSubmit(title, description, archetypes, status);
            context.closeAll();
          }}
        >
          Save Strategy
        </Button>
      </Flex>
    </Box>
  );
}
