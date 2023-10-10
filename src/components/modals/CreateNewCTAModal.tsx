import {
  Anchor,
  Button,
  Group,
  Text,
  Paper,
  useMantineTheme,
  Title,
  Flex,
  Textarea,
  LoadingOverlay,
  Card,
  Container,
  Box,
  Select,
  Switch,
} from "@mantine/core";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { Archetype, PersonaOverview } from "src";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import createCTA from "@utils/requests/createCTA";
import CTAGeneratorExample from "@common/cta_generator/CTAGeneratorExample";
import { DateInput } from "@mantine/dates";
import { API_URL } from '@constants/data';

export default function CreateNewCTAModel({
  context,
  id,
  innerProps,
}: ContextModalProps<{ personaId: number; }>) {
  const theme = useMantineTheme();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const userToken = useRecoilValue(userTokenState);
  const [ctaTypes, setCTATypes]: any = useState([] as any[]);
  const [ctaType, setCTAType] = useState("manually-added" as string);
  const [markAsScheduling, setMarkAsScheduling] = useState(false as boolean);

  const form = useForm({
    initialValues: {
      cta: "",
    },
  });

  const fetchCTATypes = async () => {
    fetch(`${API_URL}/message_generation/cta_types`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then((response) => response.json())
      .then((d) => {
        const data = d['data']
        let ctaTypesArray: any = Object.keys(data).map((key) => {
          return { value: data[key], label: data[key] };
        })

        setCTATypes(ctaTypesArray);
      }
      );
  }

  useEffect(() => {
    fetchCTATypes();
  }, []);

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    const result = await createCTA(
      userToken,
      innerProps.personaId,
      values.cta,
      expirationDate || undefined,
      ctaType,
      markAsScheduling
    );

    setLoading(false);

    if (result.status === "success") {
      showNotification({
        id: "new-cta-created",
        title: "CTA successfully created",
        message:
          "Please allow some time for it to propagate through our systems.",
        color: "blue",
        autoClose: 3000,
      });
      queryClient.invalidateQueries({
        queryKey: [`query-cta-data-${innerProps.personaId}`],
      });
    } else {
      showNotification({
        id: "new-cta-created-error",
        title: "Error while creating a new CTA",
        message: "Please contact an administrator.",
        color: "red",
        autoClose: false,
      });
    }

    context.closeModal(id);
  };

  const calculateCTAError = () => {
    const ctaText = form.getInputProps("cta").value.toLowerCase();
    

    if (ctaText.length > 120) {
      return "CTA must be less than 120 characters.";
    }

    if (
      ctaText.includes("{") && 
      (!ctaText.includes("{{name}}") && !ctaText.includes("{{company}}") && !ctaText.includes("{{industry}}"))
    ) {
      return "Format of dynamic fields: {{FIELD}}. FIELD options include 'Name', 'Company', or 'Industry'"
    } else if (
      ctaText.includes("[") && 
      (!ctaText.includes("[[name]]") && !ctaText.includes("[[company]]") && !ctaText.includes("[[industry]]"))
    ) {
      return "Format of dynamic fields: {{FIELD}}. FIELD options include 'Name', 'Company', or 'Industry'"
    }

    let collection = []
    for (let char of ctaText) {
      if (char == '{' || char == '[' || char == '}' || char == ']') {
        collection.push(char)
      }
    }

    while (collection.length > 0) {
      // Find first occurence of closing bracket
      let popped = false
      const i = collection.indexOf('}')
      if (i != -1) {
        // Make sure it is not at the beginning or end
        if (i == 0 || i == (collection.length - 1)) {
          return "Format of dynamic fields: {{FIELD}}. FIELD options include 'Name', 'Company', or 'Industry'"
        }

        // Make sure there is a '}' on the right
        if (collection[i + 1] != '}') {
          return "Format of dynamic fields: {{FIELD}}. FIELD options include 'Name', 'Company', or 'Industry'"
        }

        // Find the opening brackets
        const j = collection.lastIndexOf('{', i)
        if (j == -1 || j == 0 || j == (collection.length - 1)) {
          return "Format of dynamic fields: {{FIELD}}. FIELD options include 'Name', 'Company', or 'Industry'"
        }

        // Make sure the opening brackets are dual
        if (collection[j - 1] != '{') {
          return "Format of dynamic fields: {{FIELD}}. FIELD options include 'Name', 'Company', or 'Industry'"
        }

        // Remove the brackets from the collection
        collection.splice(i, 2)
        collection.splice(j - 1, 2)
        popped = true
      }

      // Find first occurence of closing bracket
      const j = collection.indexOf(']')
      if (j != -1) {
        // Make sure it is not at the beginning or end
        if (j == 0 || j == (collection.length - 1)) {
          return "Format of dynamic fields: {{FIELD}}. FIELD options include 'Name', 'Company', or 'Industry'"
        }

        // Make sure there is a ']' on the right
        if (collection[j + 1] != ']') {
          return "Format of dynamic fields: {{FIELD}}. FIELD options include 'Name', 'Company', or 'Industry'"
        }

        // Find the opening brackets
        const i = collection.lastIndexOf('[', j)
        if (i == -1 || i == 0 || i == (collection.length - 1)) {
          return "Format of dynamic fields: {{FIELD}}. FIELD options include 'Name', 'Company', or 'Industry'"
        }

        // Make sure the opening brackets are dual
        if (collection[i - 1] != '[') {
          return "Format of dynamic fields: {{FIELD}}. FIELD options include 'Name', 'Company', or 'Industry'"
        }

        // Remove the brackets from the collection
        collection.splice(j, 2)
        collection.splice(i - 1, 2)
        popped = true
      }

      if (!popped) {
        return "Format of dynamic fields: {{FIELD}}. FIELD options include 'Name', 'Company', or 'Industry'"
      }
    }

    return null
  };

  return (
    <Paper
      p={0}
      style={{
        position: "relative",
      }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <LoadingOverlay visible={loading} />
        <Text size="sm" mt="md">
          Call-to-Actions for LinkedIn are included at the end of a SellScale
          personalization and are the best way to start a conversation. You can
          manually add a CTA, or use our AI-powered CTA generator to brainstorm.
        </Text>

        <Card mt="md" withBorder>
          <Text weight={"bold"}>AI-Powered CTA Generator</Text>
          <Text size="sm">
            Press the button below to generate 6 CTAs based on your persona in
            seconds.
          </Text>
          <Button
            variant="outline"
            radius="md"
            size="xs"
            mt="md"
            onClick={() => {
              openContextModal({
                modal: "ctaGenerator",
                title: <Title order={3}>CTA Generator</Title>,
                innerProps: {
                  personaId: innerProps.personaId,
                  personaName: "",
                },
              });
            }}
          >
            Brainstorm CTAs with AI
          </Button>
        </Card>
        <Flex direction="column">
          <Flex direction="row">
            <Box w="75%">
              <Textarea
                mt="md"
                required
                placeholder={`I'd love to connect and learn more about you...`}
                label="Call-to-Action"
                withAsterisk
                minRows={2}
                autosize
                {...form.getInputProps("cta")}
                error={calculateCTAError()}
              />
              <Text
                size="xs"
                color={
                  form.getInputProps("cta").value.length <= 120 ? "grey" : "red"
                }
              >
                {form.getInputProps("cta").value.length}/{120}
              </Text>
            </Box>
            <Box mt="md" w="25%" pt="xl">
              <CTAGeneratorExample
                ctaText={form.getInputProps("cta").value}
                size="lg"
              />
            </Box>
          </Flex>
        </Flex>

        <Flex direction="row" mt="md">
          <Group my={20}>
            <Box>
              <Text fz='sm' fw={500}>
                Set CTA Expiration
              </Text>
              <Text fz='xs' c="dimmed">
                This CTA will automatically deactivate after the date set (optional).
              </Text>
              <DateInput
                value={expirationDate}
                onChange={setExpirationDate}
                placeholder="Set Expiration Date"
                clearable
                maw={400}
                mx="auto"
              />
            </Box>
          </Group>

          <Group my={20} ml='md'>
            <Select
              label="Select CTA Type"
              description="Select the tag that best describes this CTA. (optional)"
              placeholder="Select CTA Type"
              defaultValue={ctaType}
              searchable
              creatable
              data={ctaTypes}
              onChange={(value: string) => { setCTAType(ctaTypes.find((ctaType: any) => ctaType.value === value)?.label); }}
            />
          </Group>
        </Flex>

         <Switch
            label='If accepted, mark prospect as "scheduling"'
            defaultChecked={markAsScheduling}
            mb='md'
            onChange={() => { 
              setMarkAsScheduling(!markAsScheduling); 
          }}/>

        {error && (
          <Text color="red" size="sm" mt="sm">
            {error}
          </Text>
        )}

        {
          <Group>
            <Anchor component="button" type="button" color="dimmed" size="sm">
              {/* Need help? */}
            </Anchor>
            <Button
              variant="light"
              radius="md"
              type="submit"
              ml="auto"
              mr="auto"
              size="md"
              disabled={form.getInputProps("cta").value.length > 120 || calculateCTAError() != null}
            >
              Create new CTA
            </Button>
          </Group>
        }
      </form>
    </Paper>
  );
}
