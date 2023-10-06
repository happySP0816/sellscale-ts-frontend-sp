import {
  Paper,
  Title,
  Text,
  Stack,
  Badge,
  Card,
  Button,
  Modal,
  TextInput,
  Select,
} from "@mantine/core";
import { FC, useState } from "react";
import { NylasData } from "./MutlEmails.types";
import { IconPlus } from "@tabler/icons";
import { useDisclosure } from "@mantine/hooks";

const MultiEmails: FC<{ data: NylasData }> = ({ data }) => {
  const [opened, { open, toggle, close }] = useDisclosure(false);
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState([
    { email: "random@test.com", type: "Anchor Email" },
    { email: "random@test.com", type: "SellScale Email" },
  ]);

  const [selectItem, setSelectItem] = useState<null | string>(null);
  const onOpenModal = () => {
    setEmailInput("");
    open();
  };
  const onAddEmail = () => {
    setEmailInput("");
    setSelectItem(null);
    setEmails((oldEmails) => [
      ...oldEmails,
      {
        email: emailInput,
        type: selectItem || "Anchor Email",
      },
    ]);

    close();
  };
  return (
    <>
      <Paper withBorder m="xs" p="md" radius="md">
        <Title order={3}>{data?.name}'s Email (Coming Soon ⚠️)</Title>

        <Text fz="sm" pt="xs">
          If a thread receives a reply from an email that is not listed below, that prospect will be marked as 'replied'.
        </Text>

        <Stack mt={"xs"}>
          {emails.map((email, idx) => (
            <Card
              withBorder
              key={idx}
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <Title order={4}>{email.email}</Title>
              <Badge
                color={email.type === "Anchor Email" ? "blue" : "orange"}
                size="lg"
              >
                {email.type}
              </Badge>
            </Card>
          ))}

          <Button leftIcon={<IconPlus />} onClick={onOpenModal}>
            add more
          </Button>
        </Stack>
      </Paper>

      <Modal opened={opened} onClose={close} title="Add Email">
        <Stack>
          <TextInput
            type="email"
            label="Email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
          />

          <Select
            label="Type"
            value={selectItem}
            onChange={(value) => setSelectItem(value)}
            data={[
              { value: "Anchor Email", label: "Anchor Email" },
              { value: "SellScale Email", label: "SellScale Email" },
            ]}
          />
          <Button onClick={() => onAddEmail()}>Save</Button>
        </Stack>
      </Modal>
    </>
  );
};

export default MultiEmails;
