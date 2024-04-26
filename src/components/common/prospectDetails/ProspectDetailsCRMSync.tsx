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
import { IntegrationToIconMap } from "@pages/CRMConnectionPage";
import { IconAffiliate, IconCircleCheck } from "@tabler/icons";
import moment from "moment";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { ClientSyncCRM, ProspectShallow } from "src";

export default function ProspectDetailsCRMSync(props: {
  prospect: ProspectShallow;
  openedProspectId: number;
  crmSync: ClientSyncCRM;
}) {
  const userToken = useRecoilValue(userTokenState);

  const [account, setAccount] = useState(true);
  const [contactName, setContactName] = useState(true);
  const [opportunityName, setOpportunityName] = useState(true);

  const [synced, setsynced] = useState(false);
  const [syncableModels, setSyncableModels] = useState<string[]>([]); // ["lead", "contact", "account", "opportunity"
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
    const lead_synced = (props.crmSync.lead_sync &&
      props.prospect?.merge_lead_id) as boolean;
    const contact_synced = (props.crmSync.contact_sync &&
      props.prospect?.merge_contact_id) as boolean;
    const account_synced = (props.crmSync.account_sync &&
      props.prospect?.merge_account_id) as boolean;
    const opportunity_synced = (props.crmSync.opportunity_sync &&
      props.prospect?.merge_opportunity_id) as boolean;
    setsynced(
      lead_synced || contact_synced || account_synced || opportunity_synced
    );
    setSyncableModels(
      [
        props.crmSync.lead_sync ? "lead" : "",
        props.crmSync.contact_sync ? "contact" : "",
        props.crmSync.account_sync ? "account" : "",
        props.crmSync.opportunity_sync ? "opportunity" : "",
      ].filter((model) => model !== "")
    );
  }, [props.prospect]);

  console.log("hi", props);

  return (
    <Box style={{ flexBasis: "15%" }} p={10} px={"md"} mb={"sm"}>
      <Text fw={600}>CRM:</Text>
      <Paper
        mt={"4px"}
        p="xs"
        radius="md"
        sx={{
          cursor: "pointer",
          border: `1px solid ${!synced ? "#ced4da" : "#228be6"} `,
        }}
        bg={!synced ? "" : "#f5f9fe"}
        onClick={CRMOpen}
      >
        <Flex align={"center"} justify={"space-between"} w={"100%"}>
          <Flex align={"center"} gap={"sm"}>
            {IntegrationToIconMap.get(props.crmSync.crm_type)}
            <Text>
              {synced
                ? `${props.prospect?.full_name} synced to ${props.crmSync.crm_type}`
                : `Sync ${props.prospect?.full_name} to ${props.crmSync.crm_type}`}
            </Text>
          </Flex>
          {synced && <IconCircleCheck color="white" fill="#228be6" />}
        </Flex>
      </Paper>

      <Text color="gray" size="xs" mt="xs">
        {props.crmSync.lead_sync &&
          (props.prospect?.merge_lead_id ? "✅ Lead" : "☑️ Lead")}
        {props.crmSync.contact_sync &&
          (props.prospect?.merge_contact_id
            ? " · ✅ Contact"
            : " · ☑️ Contact")}
        {props.crmSync.account_sync &&
          (props.prospect?.merge_account_id
            ? " · ✅ Account"
            : " · ☑️ Account")}
        {props.crmSync.opportunity_sync &&
          (props.prospect?.merge_opportunity_id
            ? " · ✅ Opportunity "
            : " · ☑️ Opportunity ")}
      </Text>
      {synced && (
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
            {IntegrationToIconMap.get(props.crmSync.crm_type)}
            <Text size={30} fw={600}>
              Sync to {props.crmSync.crm_type}
            </Text>
          </Flex>
        }
      >
        <Text>
          {`Automatically create a ${syncableModels.join(", ")} in ${
            props.crmSync.crm_type
          } for ${props.prospect.full_name}.`}
        </Text>
        <Divider mt="md" mb="md" />
        <Flex direction={"column"} gap={"sm"}>
          {
            props.crmSync.lead_sync && (
              <Checkbox
                label="Create Lead"
                checked
              />
            )
          }
          {
            props.crmSync.account_sync && (
              <Checkbox
                label="Create Account"
                checked
              />
            )
          }
          {
            props.crmSync.contact_sync && (
              <Checkbox
                label="Create Contact"
                checked
              />
            )
          }
          {
            props.crmSync.opportunity_sync && (
              <Checkbox
                label="Create Opportunity"
                checked
              />
            )
          }
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
