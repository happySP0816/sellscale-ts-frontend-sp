import RealtimeResponseEngine from "@common/settings/RealtimeResponseEngine";
import {
  Box,
  Button,
  Flex,
  NumberInput,
  Paper,
  Switch,
  Text,
  Tooltip,
} from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { IconInfoCircle, IconLetterT, IconToggleRight } from "@tabler/icons";
import { DataGrid } from "mantine-data-grid";
import { useState } from "react";

export default function AssignConversationAIModal({
  innerProps,
  context,
  id,
}: ContextModalProps) {
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
    setData(
      data.map((item) =>
        item.label === label ? { ...item, ai_response: isChecked } : item
      )
    );
  };

  return (
    <Paper>
      <RealtimeResponseEngine />
    </Paper>
  );
}
