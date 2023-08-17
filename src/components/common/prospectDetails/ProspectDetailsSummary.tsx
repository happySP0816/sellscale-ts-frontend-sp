import { userTokenState } from "@atoms/userAtoms";
import {
  createStyles,
  Avatar,
  Text,
  Group,
  useMantineTheme,
  Badge,
  Flex,
  Switch,
  LoadingOverlay,
  ActionIcon,
  Tooltip,
  HoverCard,
  Title,
  Stack,
  Box,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import EditProspectModal from "@modals/EditProspectModal";
import {
  IconPhoneCall,
  IconAt,
  IconBriefcase,
  IconMail,
  IconSocial,
  IconBuildingStore,
  IconPencil,
  IconHomeHeart,
} from "@tabler/icons";
import { nameToInitials, proxyURL, valueToColor } from "@utils/general";
import { patchProspectAIEnabled } from "@utils/requests/patchProspectAIEnabled";
import { useState } from "react";
import { useRecoilValue } from "recoil";
import { EmailStore } from "src";
import EmailStoreView from "./EmailStoreView";
import ICPFitPill, { ICPFitPillOnly } from "@common/pipeline/ICPFitAndReason";

const useStyles = createStyles((theme) => ({
  icon: {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[3]
        : theme.colors.gray[5],
  },

  name: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
  },
}));

type ProspectDetailsSummaryProps = {
  fullName: string;
  prospectID: number;
  aiEnabled: boolean;
  refetch: () => void;
  title: string | null;
  email: string | null;
  linkedin: string | null;
  profilePic: string | null;
  location: string | null;
  companyName: string | null;
  companyURL?: string;
  companyHQ?: string;
  persona?: string;
  email_store?: EmailStore | null;
  icp_score?: number;
  icp_reason?: string;
};

export default function ProspectDetailsSummary(
  props: ProspectDetailsSummaryProps
) {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const { classes } = useStyles();
  const companyURL =
    props.companyName && !props.companyURL
      ? `https://www.google.com/search?q=${encodeURIComponent(
        props.companyName
      )}`
      : props.companyURL;

  const [aiEnabled, setAIEnabled] = useState<boolean>(props.aiEnabled);
  const [loading, setLoading] = useState<boolean>(false);

  const [
    editProspectModalOpened,
    { open: openProspectModal, close: closeProspectModal },
  ] = useDisclosure();

  const triggerAIEnableToggle = async () => {
    setLoading(true);

    const result = await patchProspectAIEnabled(userToken, props.prospectID);

    if (result.status === "success") {
      showNotification({
        title: "Success",
        message: "AI Enabled status updated.",
        color: "green",
        autoClose: 3000,
      });
    } else {
      showNotification({
        title: "Error",
        message: "Something went wrong. Please try again later.",
        color: "red",
        autoClose: 5000,
      });
    }

    setLoading(false);
    props.refetch();
  };

  return (
    <Group noWrap align="flex-start" pb="xs" w="100%">
      <LoadingOverlay visible={loading} />
      <Stack spacing={0}>
        <Avatar
          src={proxyURL(props.profilePic)}
          alt={props.fullName}
          color={valueToColor(theme, props.fullName)}
          radius="md"
          size={94}
        >
          {nameToInitials(props.fullName)}
        </Avatar>
        <Box m={5}>
          <ICPFitPill
            icp_fit_score={props.icp_score || -3}
            icp_fit_reason={props.icp_reason || "No ICP fit reason found."}
            archetype={props.persona}
          />
        </Box>
      </Stack>
      <Flex direction="column" w="100%">
        <Flex w="100%" justify="space-between" pr="xs">
          <Group>
            <Tooltip label={props.persona || "Persona Unassigned"} withArrow withinPortal position='bottom'>
              <Badge
                mb="4px"
                p="xs"
                variant="outline"
                radius="sm"
                size="xs"
                color={valueToColor(theme, props.persona || "Persona Unassigned")}
              >
                {(props.persona && (props.persona.slice(0, 30) + " ...")) || "Persona Unassigned"}
              </Badge>
            </Tooltip>

          </Group>
          <Switch
            label="AI enabled 🤖"
            labelPosition="right"
            size="sm"
            checked={aiEnabled}
            onChange={() => {
              setAIEnabled(!aiEnabled);
              triggerAIEnableToggle();
            }}
          />
        </Flex>
        <Flex justify="space-between">
          <Flex direction="column">
            <Group noWrap spacing={10} mt={3}>
              <IconBriefcase stroke={1.5} size={16} className={classes.icon} />
              <Text size="xs" color="dimmed">
                {props.title}
              </Text>
            </Group>

            {props.location && (
              <Group noWrap spacing={10} mt={5}>
                <IconHomeHeart stroke={1.5} size={16} className={classes.icon} />
                <Text
                  size="xs"
                  color="dimmed"
                >
                  {props.location}
                </Text>
              </Group>
            )}

            {props.email && (
              <EmailStoreView
                email={props.email}
                emailStore={props.email_store as EmailStore}
              />
            )}

            {props.linkedin && (
              <Group noWrap spacing={10} mt={5}>
                <IconSocial stroke={1.5} size={16} className={classes.icon} />
                <Text
                  size="xs"
                  color="dimmed"
                  component="a"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://${props.linkedin}`}
                >
                  {props.linkedin}
                </Text>
              </Group>
            )}

            {props.companyName && (
              <Group noWrap spacing={10} mt={5}>
                <IconBuildingStore
                  stroke={1.5}
                  size={16}
                  className={classes.icon}
                />
                <Text
                  size="xs"
                  color="dimmed"
                  component="a"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={companyURL}
                >
                  {props.companyName}
                </Text>
              </Group>
            )}

            {props.companyHQ && (
              <Group noWrap spacing={10} mt={5}>
                <IconBuildingStore
                  stroke={1.5}
                  size={16}
                  className={classes.icon}
                />
                <Text
                  size="xs"
                  color="dimmed"
                >
                  {props.companyHQ}
                </Text>
              </Group>
            )}
          </Flex>
          <Flex>
            <ActionIcon onClick={openProspectModal}>
              <IconPencil size="1rem" />
            </ActionIcon>
            <EditProspectModal
              modalOpened={editProspectModalOpened}
              openModal={openProspectModal}
              closeModal={closeProspectModal}
              backFunction={props.refetch}
              prospectID={props.prospectID}
            />
          </Flex>
        </Flex>
      </Flex>
    </Group>
  );
}
