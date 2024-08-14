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
  Box,
  Switch,
  Select,
} from "@mantine/core";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { Archetype, CTA } from "src";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import createCTA, { updateCTA } from "@utils/requests/createCTA";
import { DateInput } from "@mantine/dates";
import { API_URL } from '@constants/data';

export default function EditCTAModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{ personaId: string; cta: CTA }>) {
  const theme = useMantineTheme();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userToken = useRecoilValue(userTokenState);
  const [expirationDate, setExpirationDate] = useState<Date | null>(innerProps.cta.expiration_date ? new Date(innerProps.cta.expiration_date) : null);
  const [markAsScheduling, setMarkAsScheduling] = useState(innerProps.cta.auto_mark_as_scheduling_on_acceptance);

  const [ctaTypes, setCTATypes]: any = useState([] as any[]);
  const [ctaType, setCTAType] = useState(innerProps.cta.cta_type);
  const [typedValue, setTypedValue] = useState("");
  console.log(ctaType);

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

  const form = useForm({
    initialValues: {
      cta: innerProps.cta.text_value,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    const result = await updateCTA(userToken, innerProps.cta.id, values.cta, expirationDate || undefined, markAsScheduling, ctaType);

    setLoading(false);

    if (result.status === "success") {
      showNotification({
        id: "cta-updated",
        title: "CTA successfully updated",
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
        id: "cta-updated-error",
        title: "Error while updating CTA",
        message: "Please contact an administrator.",
        color: "red",
        autoClose: false,
      });
    }

    context.closeModal(id);
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

        <Flex direction="column">
          <Textarea
            mt="md"
            required
            placeholder={`I'd love to connect and learn more about you...`}
            label="Call-to-Action"
            withAsterisk
            autosize
            {...form.getInputProps("cta")}
          />
          <Text
            size="xs"
            color={
              form.getInputProps("cta").value.length <= 120 ? "grey" : "red"
            }
          >
            {form.getInputProps("cta").value.length}/{120}
          </Text>
        </Flex>

        <Group my={20}>
          <Box>
                <Text fz='sm' fw={500}>
                  Set CTA Expiration
                </Text>
                <Text fz='xs' c="dimmed">
                  This CTA will automatically deactivate after the date set (optional).
                </Text>
          </Box>
          <Box>
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

        <Flex mb='md'>
          <Select
            ml='md'
            label="Select CTA Type"
            searchable
            creatable
            description="Select the tag that best describes this CTA. (optional)"
            placeholder="Select CTA Type"
            defaultValue={ctaType}
            onCreate={(query: any) => {
              const item: any = { value: query, label: query };
              setCTATypes([...ctaTypes, item]);
              setCTAType(query);
              return item;
            }}
            getCreateLabel={(query) => `+ Add a CTA type for ${query}`}
            onSearchChange={(value: string) => {
              setTypedValue(value);
            }}
            onBlur={() => {
              if (typedValue) {
                setCTAType(typedValue);
                setTypedValue("");
              }
            }}
            data={ctaTypes}
            onChange={(value: string) => { setCTAType(ctaTypes.find((ctaType: any) => ctaType.value === value)?.label); }}
          />
        </Flex>

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
              disabled={form.getInputProps("cta").value.length > 120}
            >
              Update CTA
            </Button>
          </Group>
        }
      </form>
    </Paper>
  );
}
