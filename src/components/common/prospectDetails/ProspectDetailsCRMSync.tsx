import { userDataState, userTokenState } from "@atoms/userAtoms";
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
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { IntegrationToIconMap } from "@pages/CRMConnectionPage";
import { IconAffiliate, IconCircleCheck, IconNetwork } from "@tabler/icons";
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
  const userData = useRecoilValue(userDataState);

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
            {IntegrationToIconMap.get(props.crmSync.crm_type) ? (
              IntegrationToIconMap.get(props.crmSync.crm_type)
            ) : (
              <IconNetwork />
            )}
            <Text>
              {synced
                ? `${props.prospect?.full_name} synced to ${props.crmSync.crm_type}`
                : `Sync ${props.prospect?.full_name} to ${props.crmSync.crm_type}`}
            </Text>
          </Flex>
          {synced && <IconCircleCheck color="white" fill="#228be6" />}
        </Flex>
      </Paper>

      <Text size="xs" mt="xs">
        {props.crmSync.lead_sync &&
          (props.prospect?.merge_lead_id ? (
            <Tooltip withinPortal withArrow label="Leads will be created">
              <span style={{ marginRight: "8px" }}>✅ Lead</span>
            </Tooltip>
          ) : (
            <Tooltip withinPortal withArrow label="Leads will not be created">
              <span style={{ marginRight: "8px" }}>☑️ Lead</span>
            </Tooltip>
          ))}

        <Tooltip
          withinPortal
          withArrow
          label={
            props.crmSync.contact_sync
              ? "Contacts will be created"
              : "Contacts will not be created, but we will sync them to SellScale if they are created in your CRM."
          }
        >
          <span
            style={{
              opacity: props.crmSync.contact_sync ? "1" : "0.5",
              marginRight: "8px",
            }}
          >
            {props.prospect?.merge_contact_id ? "✅ Contact" : "☑️ Contact"}
          </span>
        </Tooltip>

        <Tooltip
          withinPortal
          withArrow
          label={
            props.crmSync.account_sync
              ? "Accounts will be created"
              : "Accounts will not be created, but we will sync them to SellScale if they are created in your CRM."
          }
        >
          <span
            style={{
              opacity: props.crmSync.account_sync ? "1" : "0.5",
              marginRight: "8px",
            }}
          >
            {props.prospect?.merge_account_id ? "✅ Account" : "☑️ Account"}
          </span>
        </Tooltip>

        <Tooltip
          withinPortal
          withArrow
          label={
            props.crmSync.opportunity_sync
              ? "Opportunities will be created"
              : "Opportunities will not be created but we will sync them to SellScale if they are created in your CRM."
          }
        >
          <span
            style={{
              opacity: props.crmSync.opportunity_sync ? "1" : "0.5",
              marginRight: "8px",
            }}
          >
            {props.prospect?.merge_opportunity_id
              ? "✅ Opportunity"
              : "☑️ Opportunity"}
          </span>
        </Tooltip>
      </Text>
      {synced && (
        <Flex align={"center"} justify={"space-between"} mt={"3px"}>
          <Text color="gray" fw={500} size={"sm"}>
            Last Synced: {moment().format("MMM DD, YYYY")}
          </Text>
        </Flex>
      )}
      {synced && (
        <Text color="gray" fw={500} size={"sm"}>
          Opportunity Value:{" "}
          {`$${
            props.prospect?.contract_size ||
            userData.contract_size ||
            " Not Set"
          }`}
        </Text>
      )}
      <Modal
        opened={CRMOpened}
        size={"lg"}
        onClose={CRMClose}
        title={
          <Flex align={"center"} gap={"sm"}>
            {IntegrationToIconMap.get(props.crmSync.crm_type) ? (
              IntegrationToIconMap.get(props.crmSync.crm_type)
            ) : (
              <IconNetwork />
            )}
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
          {props.crmSync.lead_sync && <Checkbox label="Create Lead" checked />}
          {props.crmSync.account_sync && (
            <Checkbox label="Create Account" checked />
          )}
          {props.crmSync.contact_sync && (
            <Checkbox label="Create Contact" checked />
          )}
          {props.crmSync.opportunity_sync && (
            <Checkbox label="Create Opportunity" checked />
          )}
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
