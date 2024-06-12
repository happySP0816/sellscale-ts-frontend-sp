import { Button, Card, Flex, Group, Modal, NumberInput, Paper, Select, Text, TextInput, Title } from "@mantine/core";
import MultiEmails from "./MultiEmails/MultiEmails";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { delay } from "lodash";
import { API_URL } from "@constants/data";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { showNotification } from "@mantine/notifications";
import { IconTrash } from "@tabler/icons";

export const InboxesManagementPage = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [openedSpamModal, { open: openSpamModal, close: closeSpamModal }] = useDisclosure(false);

  return (
    <Paper withBorder>
      <Card>
        <Flex direction={"column"} gap={"sm"}>
          <Flex direction="row" justify="space-between" align="center">
            <Text fw={600} size={24}>
              Inbox Management
            </Text>
            <Flex gap={"md"}>
              <Button color="yellow" variant="outline" onClick={openSpamModal}>
                Spam Checker
              </Button>
              <Button onClick={open}>Request More Inboxes</Button>
            </Flex>
            <InboxRequestModal opened={opened} close={close} />
            <SpamCheckerModal opened={openedSpamModal} close={closeSpamModal} />
          </Flex>
          <Text>SellScale provides multiple managed domains and inboxes in order to meet your outbounding needs. Review your inboxes and domains below.</Text>
        </Flex>

        <Flex mt="sm">
          <MultiEmails hideAnchor />
        </Flex>
      </Card>
    </Paper>
  );
};

const InboxRequestModal = (props: { opened: boolean; close: () => void }) => {
  const userToken = useRecoilValue(userTokenState);

  const form = useForm({
    initialValues: {
      numberInboxes: 0,
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitInboxRequest = async (numberInboxes: number) => {
    setIsSubmitting(true);

    fetch(`${API_URL}/domains/inboxes/request`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        number_inboxes: numberInboxes,
      }),
    }).then((response) => {
      if (response.ok) {
        showNotification({
          title: "Request Submitted",
          message: "We will contact you shortly.",
          color: "teal",
        });
        form.reset();
        props.close();
      } else {
        showNotification({
          title: "Request Failed",
          message: "Please try again later.",
          color: "red",
        });
      }
    });

    setIsSubmitting(false);
  };

  return (
    <Modal
      opened={props.opened}
      onClose={() => {
        form.reset();
        props.close();
      }}
      title={<Title order={3}>Request More Inboxes</Title>}
    >
      <Text>
        We are happy to provide more domains and inboxes for you to outbound from. Please fill out this short request form and we will contact you shortly.
      </Text>
      <form
        onSubmit={form.onSubmit((values) => {
          submitInboxRequest(values.numberInboxes);
        })}
      >
        <NumberInput mt="md" label="Number of Inboxes" placeholder="Number of Inboxes" min={0} required {...form.getInputProps("numberInboxes")} />

        {(form.getInputProps("numberInboxes").value > 0 || form.isTouched()) && (
          <>
            <Text mt="md">
              <span style={{ fontWeight: "500", fontSize: "15px" }}>Estimated Volume:</span> {form.getInputProps("numberInboxes").value * 5 * 30} emails / week
            </Text>
            <Text fz="xs">
              {`${form.getInputProps("numberInboxes").value || 0} inboxes\n x 30 emails per inbox per day x 5 days per week = ${
                form.getInputProps("numberInboxes").value * 5 * 30
              } emails per week`}
            </Text>
          </>
        )}

        <Group position="right" mt="md">
          <Button type="submit" disabled={form.getInputProps("numberInboxes").value < 1} loading={isSubmitting}>
            Request
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

const SpamCheckerModal = (props: { opened: boolean; close: () => void }) => {
  return (
    <Modal
      title={
        <Flex align={"center"} gap={"sm"}>
          <IconTrash color="orange" size={"1.4rem"} className="mb-[3px]" />
          <Title order={3}>Spam Checker</Title>
        </Flex>
      }
      opened={props.opened}
      onClose={() => {
        props.close();
      }}
    >
      <Paper>
        <Text color="gray" size={"sm"}>
          Check if your emails are landing in spam.
        </Text>
        <Select data={[""]} placeholder="Select email template" label="Choose a recent email template:" mt={"lg"} />
        <TextInput placeholder="Enter email ID" label="Send email to:" mt={"lg"} />
        <Flex gap={"md"} mt={40}>
          <Button fullWidth variant="outline" color="gray">
            Cancel
          </Button>
          <Button fullWidth onClick={() => alert("Email sent to <Insert Email Here>!")}>
            Send Spam Check Email
          </Button>
        </Flex>
      </Paper>
    </Modal>
  );
};
