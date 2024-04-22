import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  Modal,
  Paper,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { IconAffiliate, IconCircleCheck } from "@tabler/icons";
import moment from "moment";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { ProspectShallow } from "src";

export default function ProspectDetailsCRMSync(props: {
  prospect: ProspectShallow;
  openedProspectId: number;
}) {
  const userToken = useRecoilValue(userTokenState);

  const [account, setAccount] = useState(true);
  const [contactName, setContactName] = useState(true);
  const [opportunityName, setOpportunityName] = useState(true);

  const [syncHubspot, setSyncHubspot] = useState(false);
  const [CRMOpened, { open: CRMOpen, close: CRMClose }] = useDisclosure(false);
  const [loadingSyncButton, setLoadingSyncButton] = useState(false);

  const createOpportunity = () => {
    setLoadingSyncButton(true);

    fetch(`${API_URL}/merge_crm/opportunity/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + userToken,
      },
      body: JSON.stringify({
        prospect_id: props.openedProspectId,
      }),
    })
      .then((response) => {
        if (response.status !== 200) {
          showNotification({
            title: "Error",
            message: "Error creating opportunity in Hubspot",
            color: "red",
            autoClose: 3000,
          });
          return null;
        }
        return response.json();
      })
      .then((data) => {
        showNotification({
          title: "Success",
          message: "Opportunity created in Hubspot",
          color: "green",
          autoClose: 3000,
        });
        CRMClose();
        setSyncHubspot(true);
      })
      .catch((error) => {
        console.error("Error:", error);
        showNotification({
          title: "Error",
          message: "Error creating opportunity in Hubspot",
          color: "red",
          autoClose: 3000,
        });
      })
      .finally(() => {
        setLoadingSyncButton(false);
      });
  };

  useEffect(() => {
    setSyncHubspot(
      (props.prospect?.merge_account_id?.length || 0) +
        (props.prospect?.merge_contact_id?.length || 0) +
        (props.prospect?.merge_opportunity_id?.length || 0) >
        0
        ? true
        : false
    );
  }, [props.prospect]);

  return (
    <Box style={{ flexBasis: "15%" }} p={10} px={"md"} mb={"sm"}>
      <Text fw={600}>CRM:</Text>
      <Paper
        mt={"4px"}
        p="xs"
        radius="md"
        sx={{
          cursor: "pointer",
          border: `1px solid ${!syncHubspot ? "#ced4da" : "#228be6"} `,
        }}
        bg={!syncHubspot ? "" : "#f5f9fe"}
        onClick={CRMOpen}
      >
        <Flex align={"center"} justify={"space-between"} w={"100%"}>
          <Flex align={"center"} gap={"sm"}>
            <IconAffiliate rotate={"90%"} color="orange" />
            <Text>
              {syncHubspot
                ? props.prospect?.full_name + " synced to Hubspot"
                : "Sync " + props.prospect?.full_name + " to Hubspot"}
            </Text>
          </Flex>
          {syncHubspot && <IconCircleCheck color="white" fill="#228be6" />}
        </Flex>
      </Paper>

      <Text color="gray" size="xs" mt="xs">
        {props.prospect?.merge_account_id ? "✅ Account · " : "☑️ Account · "}
        {props.prospect?.merge_contact_id ? "✅ Contact · " : "☑️ Contact · "}
        {props.prospect?.merge_opportunity_id
          ? "✅ Opportunity "
          : "☑️ Opportunity "}
      </Text>
      {syncHubspot && (
        <Flex align={"center"} justify={"space-between"} mt={"3px"}>
          <Text color="gray" fw={500} size={"sm"}>
            Last Synced: {moment().format("MMM DD, YYYY")}
          </Text>
        </Flex>
      )}
      <Text color="gray" fw={500} size={"sm"}>
        Opportunity Value: {`$${props.prospect?.contract_size}` || "N/A"}
      </Text>
      <Modal
        opened={CRMOpened}
        size={"lg"}
        onClose={CRMClose}
        title={
          <Flex align={"center"} gap={"sm"}>
            <IconAffiliate size={"1.4rem"} color="orange" />
            <Text size={30} fw={600}>
              Sync to Hubspot
            </Text>
          </Flex>
        }
      >
        <Text>
          Automatically create a new Account, Contact, and Opportunity in
          Hubspot for {props.prospect.full_name}.
        </Text>
        <Divider mt="md" mb="md" />
        <Flex direction={"column"} gap={"sm"}>
          <Flex direction={"column"} gap={"md"}>
            <Checkbox
              label="Create Account"
              disabled
              checked={account}
              onChange={() => setAccount(!account)}
            />
          </Flex>
          <Flex direction={"column"} gap={"md"}>
            <Checkbox
              label="Create Contact"
              disabled
              checked={contactName}
              onChange={() => setContactName(!contactName)}
            />
          </Flex>
          <Flex direction={"column"} gap={"md"}>
            <Checkbox
              label="Create Opportunity"
              disabled
              checked={opportunityName}
              onChange={() => setOpportunityName(!opportunityName)}
            />
          </Flex>
          <Flex align={"center"} gap={"sm"} mt={"xl"}>
            <Button
              variant="outline"
              size="md"
              fullWidth
              color="red"
              onClick={CRMClose}
            >
              Cancel
            </Button>
            <Button
              loading={loadingSyncButton}
              size="md"
              fullWidth
              onClick={() => {
                createOpportunity();
              }}
            >
              Sync
            </Button>
          </Flex>
        </Flex>
      </Modal>
    </Box>
  );
}
