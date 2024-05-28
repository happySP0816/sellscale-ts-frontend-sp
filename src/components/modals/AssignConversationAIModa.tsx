import { Box, Button, Flex, NumberInput, Paper, Switch, Text, Tooltip } from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { IconInfoCircle, IconLetterT, IconToggleRight } from "@tabler/icons";
import { DataGrid } from "mantine-data-grid";
import { useState } from "react";

export default function AssignConversationAIModal({ innerProps, context, id }: ContextModalProps) {
  const [aiResponse, setAIResponse] = useState(false);
  const [data, setData] = useState([
    {
      label: "Objection",
      ai_response: true,
    },
    {
      label: "Next steps",
      ai_response: false,
    },
    {
      label: "Revival",
      ai_response: true,
    },
    {
      label: "Question",
      ai_response: true,
    },
    {
      label: "Demo Set",
      ai_response: true,
    },
  ]);

  const handleSwitchChange = (isChecked: boolean, label: string) => {
    setData(data.map((item) => (item.label === label ? { ...item, ai_response: isChecked } : item)));
  };

  return (
    <Paper>
      <Text color="gray" size={"xs"}>
        Configure how you want SellScale AI to manage replies.
      </Text>
      <Box mt={"md"}>
        <Text size={"sm"} fw={500}>
          SellScale AI Response Time:
        </Text>
        <Flex align={"center"} gap={4} mt={2}>
          <Text color="gray">Wait</Text>
          <NumberInput w={100} size="sm" />
          <Text color="gray">hours before attempting to respond</Text>
        </Flex>
        <DataGrid
          data={data}
          highlightOnHover
          withSorting
          withColumnBorders
          withBorder
          mt={"md"}
          columns={[
            {
              accessorKey: "label",
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <IconLetterT color="gray" size={"0.9rem"} />
                  <Text color="gray">Reply Lavel</Text>
                </Flex>
              ),
              cell: (cell) => {
                let { label } = cell.row.original;

                return (
                  <Flex gap={"xs"} w={"100%"} h={"100%"} px={"sm"} align={"center"} justify={"space-between"}>
                    <Flex gap={"xs"} align={"center"}>
                      <Text fw={500}>{label}</Text>
                      <Tooltip label="Tooltip">
                        <IconInfoCircle size={"0.9rem"} color="gray" />
                      </Tooltip>
                    </Flex>
                  </Flex>
                );
              },
            },
            {
              accessorKey: "response",
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <IconToggleRight color="gray" size={"0.9rem"} />
                  <Text color="gray">Respond With AI</Text>
                </Flex>
              ),
              cell: (cell) => {
                let { ai_response, label } = cell.row.original;

                return (
                  <Flex gap={"xs"} w={"100%"} h={"100%"} px={"sm"} align={"center"} justify={"space-between"}>
                    <Flex gap={"xs"} align={"center"}>
                      <Text color={ai_response ? "#228BE6" : "gray"} fw={500}>
                        {ai_response ? "Respond With SellScale AI" : "Respond By Myself"}
                      </Text>
                      <Switch defaultChecked={ai_response} onChange={(e) => handleSwitchChange(e.target.checked, label)} />
                    </Flex>
                  </Flex>
                );
              },
            },
          ]}
        />
        <Flex align={"center"} gap={"xl"}>
          <Button fullWidth variant="outline" color="gray" onClick={() => context.closeModal(id)}>
            Go Back
          </Button>
          <Button fullWidth onClick={() => context.closeModal(id)}>
            Save
          </Button>
        </Flex>
      </Box>
    </Paper>
  );
}
