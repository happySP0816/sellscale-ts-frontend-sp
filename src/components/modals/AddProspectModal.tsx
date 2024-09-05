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
  TextInput,
  Space,
  Accordion,
  Table,
  Checkbox,
  Loader,
} from "@mantine/core";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { Archetype, CTA } from "src";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { createProspectFromLinkedinLink } from "@utils/requests/createProspectFromLinkedinLink";
import { getProspectByID } from "@utils/requests/getProspectByID";
import { generateInitialLiMessage } from "@utils/requests/generateInitialLiMessage";
import { updateProspect } from "@utils/requests/updateProspect";
import { addProspectReferral } from "@utils/requests/addProspectReferral";
import { API_URL } from "@constants/data";

interface FormValue {
  linkedinURL: string;
  email: string;
}

export default function AddProspectModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{ archetypeId: number; sourceProspectId?: number }>) {
  const theme = useMantineTheme();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [duplicateLoading, setDuplicateLoading] = useState(false);

  const [duplicateStep, setDuplicateStep] = useState(false);

  const [duplicateContacts, setDuplicateContacts] = useState<any[]>([]);

  const [formValue, setFormValue] = useState<FormValue | null>(null);

  const userToken = useRecoilValue(userTokenState);

  const form = useForm({
    initialValues: {
      li_url: "",
      email: "",
    },
  });

  const setOverrideAll = (override: boolean, same_archetype: boolean) => {
    if (duplicateContacts) {
      setDuplicateContacts((prevState) =>
        prevState!.map((prospect) => {
          if (same_archetype) {
            if (prospect.same_archetype) {
              return { ...prospect, override: override };
            }

            return prospect;
          } else {
            if (!prospect.same_archetype) {
              return { ...prospect, override: override };
            }

            return prospect;
          }
        })
      );
    }
  };

  const handleGetDuplicate = async (values: typeof form.values) => {
    setFormValue({linkedinURL: values.li_url, email: values.email});
    setDuplicateLoading(true);

    const response = await fetch(
      `${API_URL}/prospect/get_duplicate_from_linkedin_link`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          linkedin_url: values.li_url,
          archetype: innerProps.archetypeId,
        }),
      }
    );

    if (!response.ok) {
      showNotification({
        id: "prospect-duplicate-error",
        title: "Error while finding duplicate prospect",
        message:
          "Prospect may have already been added by you or someone else in your organization.",
        color: "red",
      });
    }

    const jsonResponse = await response.json();

    setDuplicateContacts(jsonResponse.duplicate);
    setDuplicateStep(true);
    setDuplicateLoading(false);
  };

  const handleSubmit = async () => {
    setLoading(true);

    if (!formValue) {
      return -1;
    }

    const prospectId = await (async () => {
      const createResponse = await createProspectFromLinkedinLink(
        userToken,
        innerProps.archetypeId,
        formValue.linkedinURL,
        duplicateContacts[0].override
      );
      if (createResponse.status !== "success") {
        setLoading(false);
        console.error("Error while creating prospect", createResponse);

        showNotification({
          id: "prospect-added-error",
          title: "Error while adding prospect",
          message:
            "Prospect may have already been added by you or someone else in your organization.",
          color: "red",
          autoClose: false,
        });

        return -1;
      }

      // Create referral
      if (innerProps.sourceProspectId) {
        const referralResponse = await addProspectReferral(
          userToken,
          innerProps.sourceProspectId,
          createResponse.data.prospect_id
        );
      }

      //const prospectResponse = await getProspectByID(userToken, createResponse.data.prospect_id);

      // Add email to prospect
      const updateResponse = await updateProspect(
        userToken,
        createResponse.data.prospect_id,
        formValue.email
      );
      if (updateResponse.status !== "success") return -1;

      return createResponse.data.prospect_id as number;
    })();

    setLoading(false);

    if (prospectId !== -1) {
      showNotification({
        id: "prospect-added",
        title: "Prospect successfully added",
        message:
          "Please allow some time for it to propagate through our systems.",
        color: "blue",
        autoClose: 3000,
      });
      context.closeModal(id);

      openContextModal({
        modal: "sendOutreach",
        title: <Title order={3}>Send Outreach</Title>,
        innerProps: {
          prospectId: prospectId,
          archetypeId: innerProps.archetypeId,
          email: formValue.email,
        },
      });

      if (innerProps.sourceProspectId) {
        queryClient.invalidateQueries({
          queryKey: [`query-prospect-details-${innerProps.sourceProspectId}`],
        });
      }
    } else {
      showNotification({
        id: "prospect-added-error",
        title: "Error while adding prospect",
        message:
          "Please contact an administrator. This prospect may have already been added by you or someone else in your organization.",
        color: "red",
        autoClose: false,
      });
      context.closeModal(id);
    }
  };

  return (
    <Paper
      p={0}
      style={{
        position: "relative",
      }}
    >
      {duplicateStep && duplicateContacts && duplicateContacts.length !== 0 && (
        <>
          <Text>
            We have found some prospects that are already added to your prospect
            database.
          </Text>
          <Text>
            Please check the prospects that you want to overwrite and move to
            your new segment/campaign.
          </Text>
          <Text>We will also reset the prospect's status</Text>
          <Space h={"xl"} />
          <Text>Click "Yes, let's do it! 🚀" whenever you are ready.</Text>
          <Space h={"xl"} />

          <Accordion
            variant={"separated"}
            defaultValue={"duplicate-different-archetypes"}
          >
            <Accordion.Item value={"duplicate-different-archetypes"}>
              <Accordion.Control>
                Prospects from different campaigns
              </Accordion.Control>
              <Accordion.Panel>
                <Table>
                  <thead>
                    <tr>
                      <th>
                        <Checkbox
                          onChange={(event) =>
                            setOverrideAll(event.currentTarget.checked, false)
                          }
                          checked={duplicateContacts
                            .filter((item) => !item.same_archetype)
                            .every((item) => item.override)}
                        />
                      </th>
                      <th>Name</th>
                      <th>Company</th>
                      <th>Title</th>
                      <th>SDR</th>
                      <th>Segment</th>
                      <th>Campaign</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {duplicateContacts
                      .filter((prospect) => !prospect.same_archetype)
                      .map((prospect) => {
                        return (
                          <tr key={prospect.row}>
                            <td>
                              <Checkbox
                                checked={prospect.override}
                                onChange={(event) => {
                                  setDuplicateContacts((prevState) => {
                                    return prevState!.map((item) => {
                                      if (item.row === prospect.row) {
                                        return {
                                          ...item,
                                          override: event.target.checked,
                                        };
                                      }

                                      return item;
                                    });
                                  });
                                }}
                              />
                            </td>
                            <td>{prospect.full_name}</td>
                            <td>{prospect.company}</td>
                            <td>{prospect.title}</td>
                            <td>{prospect.sdr}</td>
                            <td>{prospect.segment_title ?? "None"}</td>
                            <td>{prospect.archetype}</td>
                            <td>{prospect.status}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </Table>
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value={"duplicate-same-archetypes"}>
              <Accordion.Control>
                Prospects from the current campaign
              </Accordion.Control>
              <Accordion.Panel>
                <Table>
                  <thead>
                    <tr>
                      <th>
                        <Checkbox
                          onChange={(event) =>
                            setOverrideAll(event.currentTarget.checked, true)
                          }
                          checked={duplicateContacts
                            .filter((item) => item.same_archetype)
                            .every((item) => item.override)}
                        />
                      </th>
                      <th>Name</th>
                      <th>Company</th>
                      <th>Title</th>
                      <th>SDR</th>
                      <th>Segment</th>
                      <th>Campaign</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {duplicateContacts
                      .filter((prospect) => prospect.same_archetype)
                      .map((prospect) => {
                        return (
                          <tr key={prospect.row}>
                            <td>
                              <Checkbox
                                checked={prospect.override}
                                onChange={(event) => {
                                  setDuplicateContacts((prevState) => {
                                    return prevState!.map((item) => {
                                      if (item.row === prospect.row) {
                                        return {
                                          ...item,
                                          override: event.currentTarget.checked,
                                        };
                                      }

                                      return item;
                                    });
                                  });
                                }}
                              />
                            </td>
                            <td>{prospect.full_name}</td>
                            <td>{prospect.company}</td>
                            <td>{prospect.title}</td>
                            <td>{prospect.sdr}</td>
                            <td>{prospect.segment_title ?? "None"}</td>
                            <td>{prospect.archetype}</td>
                            <td>{prospect.status}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </Table>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </>
      )}
      {duplicateStep && duplicateContacts && duplicateContacts.length === 0 && (
        <>
          <Text>We’re ready to Upload the prospects!</Text>
        </>
      )}
      {duplicateStep && (
        <>
          <Space h={"96px"} />
          <Flex justify={"space-between"}>
            <Button
              onClick={() => {
                close();
                setOverrideAll(false, true);
                setOverrideAll(false, false);
              }}
              variant={"outline"}
              color={"gray"}
            >
              Skip All
            </Button>
            <Button onClick={() => handleSubmit()}>
              {loading ? <Loader /> : "Upload! 🚀"}
            </Button>
          </Flex>
        </>
      )}
      {!duplicateStep && (
        <form onSubmit={form.onSubmit(handleGetDuplicate)}>
          <LoadingOverlay visible={duplicateLoading} />

          <Flex direction="column">
            <TextInput
              placeholder="https://www.linkedin.com/in/..."
              label="LinkedIn URL"
              required
              {...form.getInputProps("li_url")}
            />
          </Flex>

          <Flex direction="column">
            <TextInput
              placeholder="Optional"
              label="Email"
              {...form.getInputProps("email")}
            />
          </Flex>

          {
            <Group pt="md">
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
              >
                Find Duplicate
              </Button>
            </Group>
          }
        </form>
      )}
    </Paper>
  );
}
