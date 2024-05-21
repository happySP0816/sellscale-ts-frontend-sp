import { Button, Flex, Paper, ScrollArea } from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import FindContactsPage from "@pages/FindContactsPage";
import { useState } from "react";

export default function CampaignContactsModal({
  innerProps,
  context,
  id,
}: ContextModalProps<{
  setContacts: Function;
}>) {
  const [contactsData, setContactsData] = useState([
    {
      avatar: "",
      name: "Abhay A Shukla",
      prospects: "very high",
      companies: "Director Molecular Research, KSL BIomedical",
    },
    {
      avatar: "",
      name: "Aaron Mackey",
      prospects: "very high",
      companies: "VP, Head of AI and ML, Sonata Therapeutics",
    },
    {
      avatar: "",
      name: "Abhay A Shukla",
      prospects: "very high",
      companies: "Director Molecular Research, KSL BIomedical",
    },
    {
      avatar: "",
      name: "Abhay A Shukla",
      prospects: "very high",
      companies: "VP, Head of AI and ML, Sonata Therapeutics",
    },
    {
      avatar: "",
      name: "Abhay A Shukla",
      prospects: "very high",
      companies: "Director Molecular Research, KSL BIomedical",
    },
    {
      avatar: "",
      name: "Abhay A Shukla",
      prospects: "very high",
      companies: "VP, Head of AI and ML, Sonata Therapeutics",
    },
    {
      avatar: "",
      name: "Abhay A Shukla",
      prospects: "very high",
      companies: "Director Molecular Research, KSL BIomedical",
    },
  ]);
  return (
    <>
      <Paper withBorder>
        <ScrollArea h={700}>
          <FindContactsPage />
        </ScrollArea>
      </Paper>
      <Flex gap={"md"} mt={"lg"}>
        <Button
          size="sm"
          fullWidth
          variant="outline"
          color="gray"
          onClick={() => {
            context.closeModal(id);
          }}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          fullWidth
          onClick={() => {
            innerProps.setContacts(contactsData);
            context.closeModal(id);
          }}
        >
          Add Contacts
        </Button>
      </Flex>
    </>
  );
}
