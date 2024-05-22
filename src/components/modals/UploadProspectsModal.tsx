import {
  Text,
  Paper,
  useMantineTheme,
  Stack,
  Select,
  TextInput,
  Textarea,
  LoadingOverlay,
  Group,
  Switch,
  Flex,
  Divider,
  Button,
} from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { useEffect, useRef, useState } from "react";
import { IconBrandLinkedin, IconMailOpened, IconUsers } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { logout } from "@auth/core";
import { Archetype, MsgResponse } from "src";
import { API_URL } from "@constants/data";
import CreatePersona from "@common/persona/CreatePersona";
import Hook from "@pages/channels/components/Hook";

export default function UploadProspectsModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{ mode: "ADD-ONLY" | "ADD-CREATE" | "CREATE-ONLY" }>) {
  const theme = useMantineTheme();
  const userData = useRecoilValue(userDataState);
  const [personas, setPersonas] = useState<
    { value: string; label: string; group: string | undefined }[]
  >([]);
  const defaultPersonas = useRef<
    { value: string; label: string; group: string | undefined }[]
  >([]);
  const [createdPersona, setCreatedPersona] = useState("");
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

  const [newCTAText, setNewCTAText] = useState("");
  const addCTAInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [ctas, setCTAs] = useState<{ id: number; cta: string }[]>([]);

  const [fitReason, setFitReason] = useState("");
  const [icpMatchingPrompt, setICPMatchingPrompt] = useState(
    "Describe your persona here ..."
  );

  const [contactObjective, setContactObjective] = useState(
    "Set up a discovery call in order to identify a pain point"
  );

  const [personaContractSize, setPersonaContractSize] = useState(
    userData.client.contract_size
  );
  const [templateMode, setTemplateMode] = useState<string>("cta");

  const [
    loadingPersonaBuyReasonGeneration,
    setLoadingPersonaBuyReasonGeneration,
  ] = useState(false);
  const generatePersonaBuyReason = async (): Promise<MsgResponse> => {
    setLoadingPersonaBuyReasonGeneration(true);
    const res = await fetch(
      `${API_URL}/client/archetype/generate_persona_buy_reason`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          persona_name: createdPersona,
        }),
      }
    )
      .then(async (r) => {
        if (r.status === 200) {
          return {
            status: "success",
            title: "Success",
            message: "Persona buying reason generated successfully",
            data: await r.json(),
          };
        } else {
          return {
            status: "error",
            title: `Error (${r.status})`,
            message: "Failed to generate persona buying reason",
            data: {},
          };
        }
      })
      .catch((e) => {
        return {
          status: "error",
          title: "Error",
          message: e.message,
          data: {},
        };
      });
    setLoadingPersonaBuyReasonGeneration(false);
    setFitReason(res.data.description);
    return res as MsgResponse;
  };

  const [
    loadingICPMatchingPromptGeneration,
    setLoadingICPMatchingPromptGeneration,
  ] = useState(false);
  const generateICPMatchingPrompt = async (): Promise<MsgResponse> => {
    setLoadingICPMatchingPromptGeneration(true);
    const res = await fetch(
      `${API_URL}/client/archetype/generate_persona_icp_matching_prompt`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          persona_name: selectedPersona,
          persona_buy_reason: fitReason,
        }),
      }
    )
      .then(async (r) => {
        if (r.status === 200) {
          return {
            status: "success",
            title: "Success",
            message: "ICP matching prompt generated successfully",
            data: await r.json(),
          };
        } else {
          return {
            status: "error",
            title: `Error (${r.status})`,
            message: "Failed to generate ICP matching prompt",
            data: {},
          };
        }
      })
      .catch((e) => {
        return {
          status: "error",
          title: "Error",
          message: e.message,
          data: {},
        };
      });
    setLoadingICPMatchingPromptGeneration(false);
    setICPMatchingPrompt(res.data.description);
    return res as MsgResponse;
  };

  const userToken = useRecoilValue(userTokenState);

  useEffect(() => {
    if (personas.length === 0 && defaultPersonas.current.length > 0) {
      setPersonas(defaultPersonas.current);
      setSelectedPersona(defaultPersonas.current[0].value);
    }
  }, [defaultPersonas.current]);

  return (
    <Paper
      p={0}
      style={{
        position: "relative",
        backgroundColor:
          theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
      }}
    >
      <Stack spacing="xs">
        <Text color="gray" size={"sm"}>
          Enter the information below to describe and fine-tune your campaign
        </Text>
        <>
          {innerProps.mode === "CREATE-ONLY" ? (
            <>
              <TextInput
                placeholder="eg. C-Suite Sales Leaders in tech companies"
                label="Campaign Name"
                value={createdPersona}
                // required
                onChange={(e) => setCreatedPersona(e.currentTarget.value)}
              />

              {/* <Textarea
                label="Who do you want to target"
                placeholder="Eg. I want to see product mangers in chicago who went to BYU and are currently in a hedge fund role at a large financial institution"
                minRows={3}
                onChange={(e) => setICPMatchingPrompt(e.currentTarget.value)}
              />

              <Textarea
                withAsterisk
                value={contactObjective}
                description="Describe the objective of the outreach."
                placeholder="Eg. I want to grab a coffee with them!"
                label="What do you want to say"
                onChange={(e) => setContactObjective(e.target.value)}
              /> */}
            </>
          ) : (
            <Select
              label={"Set Persona"}
              defaultValue={
                defaultPersonas.current.length === 1 ||
                (defaultPersonas.current.length > 1 &&
                  defaultPersonas.current[0].group === "Active" &&
                  defaultPersonas.current[1].group === "Inactive")
                  ? defaultPersonas.current[0].value
                  : undefined
              }
              data={personas}
              placeholder={
                innerProps.mode === "ADD-ONLY"
                  ? "Select a persona for the prospects"
                  : "Select or create a persona for the prospects"
              }
              nothingFound={"Nothing found"}
              icon={<IconUsers size={14} />}
              searchable
              creatable={innerProps.mode === "ADD-CREATE"}
              clearable
              getCreateLabel={(query) => (
                <>
                  <span style={{ fontWeight: 700 }}>New Persona: </span>
                  {query}
                </>
              )}
              onCreate={(query) => {
                // value = ID if selected, name if created
                const item = { value: query, label: query, group: undefined }; // group: "Active"
                setPersonas((current) => [...current, item]);
                setCreatedPersona(query);
                return item;
              }}
              onChange={(value) => {
                // If created persona exists and is one of the existing personas, clear it
                if (
                  createdPersona.length > 0 &&
                  personas.filter((personas) => personas.value === value)
                    .length > 0
                ) {
                  setPersonas(defaultPersonas.current);
                  setCreatedPersona("");
                }
                setSelectedPersona(value);
              }}
            />
          )}
        </>

        <CreatePersona
          createPersona={{
            name: createdPersona,
            ctas: ctas.map((cta) => cta.cta),
            fitReason: fitReason,
            icpMatchingPrompt: icpMatchingPrompt,
            contactObjective: contactObjective,
            contractSize: personaContractSize,
            templateMode: templateMode === "template",
          }}
        />
      </Stack>
    </Paper>
  );
}
