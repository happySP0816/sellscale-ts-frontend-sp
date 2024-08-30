import { userDataState, userTokenState } from "@atoms/userAtoms";
import {
  Button,
  Text,
  Paper,
  useMantineTheme,
  Box,
  Stack,
  Center,
  Group,
  TextInput,
  Select,
  SelectProps,
  LoadingOverlay,
} from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import {
  IconAlignJustified,
  IconAlignLeft,
  IconAlignRight,
} from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { clonePersona } from "@utils/requests/clonePersona";
import { getClientArchetypes } from "@utils/requests/getClientArchetypes";
import getPersonas, {
  getPersonasForEntireClient,
} from "@utils/requests/getPersonas";
import { useState } from "react";
import { useRecoilValue } from "recoil";
import { Archetype } from "src";

export default function DuplicateCampaignModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  fetchAllCampaigns: () => void;
}>) {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [archetypeId, setArchetypeId] = useState<number>();

  const { data: archetypes, isFetching } = useQuery({
    queryKey: [`query-get-archetypes-for-dupe`],
    queryFn: async () => {
      const result = await getPersonasForEntireClient(userToken);
      return result.status === "success"
        ? (result.data as Archetype[]).sort((a, b) =>
            a.archetype.localeCompare(b.archetype)
          )
        : [];
    },
  });

  const onDuplicateCampaign = async () => {
    const archetype = archetypes?.find((a) => a.id === archetypeId);
    console.log("archetype: ", archetype);
    if (!archetype) return;

    setLoading(true);
    console.log("on duplicate campaign");
    const response = await clonePersona(
      userToken,
      archetype.id,
      {
        personaName: name.trim() || archetype.archetype,
        personaFitReason: "",
        personaICPMatchingInstructions: archetype.icp_matching_prompt,
        personaContactObjective: "",
      },
      {
        ctas: true,
        bumpFrameworks: true,
        voices: true,
        emailBlocks: true,
        icpFilters: true,
        emailSteps: true,
        liInitMsg: true,
      }
    );
    setLoading(false);

    if (response.status === "success") {
      showNotification({
        title: "Campaign Created",
        message: "Successfully duplicated campaign",
        color: theme.colors.green[6],
      });
      context.closeAll();
      innerProps.fetchAllCampaigns();
    }
  };

  return (
    <Paper
      p={0}
      h={"20vh"}
      style={{
        position: "relative",
      }}
    >
      <TextInput
        label="Name"
        placeholder="Campaign Name"
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
      />
      <Select
        mt="md"
        searchable
        withinPortal
        label="Campaign to Duplicate"
        placeholder="Select Campaign"
        data={
          archetypes
            ?.filter((a) => !a.is_unassigned_contact_archetype)
            .map((a) => ({
              value: `${a.id}`,
              label: a.client_sdr_name + " - " + a.emoji + " " + a.archetype,
            })) ?? []
        }
        onChange={(value) => {
          if (!value) return;
          setArchetypeId(parseInt(value));
        }}
      />
      <Button
        mt="md"
        loading={isFetching || loading}
        disabled={!archetypeId}
        fullWidth
        onClick={onDuplicateCampaign}
      >
        Duplicate Campaign
      </Button>
    </Paper>
  );
}
