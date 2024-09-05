import { currentProjectState } from "@atoms/personaAtoms";
import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import {
  Avatar,
  Button,
  Flex,
  Group,
  Text,
  TextInput,
  Title,
  createStyles,
  Modal,
  Space,
  Accordion,
  Table,
  Checkbox,
  Loader,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconBriefcase, IconSocial } from "@tabler/icons";
import { proxyURL } from "@utils/general";
import { createProspectFromLinkedinLink } from "@utils/requests/createProspectFromLinkedinLink";
import { getProspectByID } from "@utils/requests/getProspectByID";
import { useState } from "react";
import { useRecoilValue } from "recoil";
import { ProspectDetails } from "src";

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

type LinkedInUrlUploadProps = {
  afterUpload: () => void;
};

export default function LinkedInURLUpload(props: LinkedInUrlUploadProps) {
  const { classes } = useStyles();

  const userToken = useRecoilValue(userTokenState);
  const [loading, setLoading] = useState(false);
  const currentProject = useRecoilValue(currentProjectState);

  const [duplicateLoading, setDuplicateLoading] = useState<boolean>(false);

  const [duplicateModalOpen, setDuplicateModalOpen] = useState<boolean>(false);

  const [duplicateContacts, setDuplicateContacts] = useState<any[]>([]);

  const [url, setURL] = useState<string>("");
  const [prospectDetails, setProspectDetails] = useState<ProspectDetails>();

  const triggerUploadProspectFromLinkedInURL = async () => {
    setLoading(true);
    setProspectDetails(undefined);

    const result = await createProspectFromLinkedinLink(
      userToken,
      currentProject?.id || -1,
      url,
      duplicateContacts[0]?.override,
    );
    if (result.status === "success") {
      showNotification({
        title: "Success",
        message: "Successfully uploaded prospect from LinkedIn URL",
        color: "green",
        autoClose: 3000,
      });
      setURL("");

      props.afterUpload();

      const prospectResponse = await getProspectByID(
        userToken,
        result.data.data.prospect_id
      );
      if (prospectResponse.status === "success") {
        setProspectDetails(prospectResponse.data satisfies ProspectDetails);
      }

      setLoading(false);
    } else {
      let message: any = result.message.split("Res: ")[1];
      message = JSON.parse(message);
      showNotification({
        title: "Error",
        message:
          message.message ||
          "Could not upload. Double check profile URL and for duplicate entry.",
        color: "red",
        autoClose: 3000,
      });
      setLoading(false);
    }

    setLoading(false);
    setDuplicateModalOpen(false);
  };

  const handleGetDuplicate = async () => {
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
          linkedin_url: url,
          archetype: currentProject?.id,
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
    setDuplicateLoading(false);
    setDuplicateModalOpen(true);
  };

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

  const linkedin_public_id =
    prospectDetails?.li.li_profile?.split("/in/")[1]?.split("/")[0] ?? "";

  return (
    <>
      <Modal
        opened={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        title="Ready To Upload?"
        size={"1100px"}
      >
        {duplicateContacts && duplicateContacts.length !== 0 && (
          <>
            <Text>
              We have found some prospects that are already added to your
              prospect database.
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
                                            override:
                                              event.target.checked,
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
                                            override:
                                              event.currentTarget.checked,
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
        {duplicateContacts && duplicateContacts.length === 0 && (
          <>
            <Text>We’re ready to Upload the prospects!</Text>
          </>
        )}
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
          <Button onClick={() => triggerUploadProspectFromLinkedInURL()}>
            {loading ? <Loader /> : "Upload! 🚀"}
          </Button>
        </Flex>
      </Modal>
      <Flex w="100%" direction="column">
        <TextInput
          placeholder="https://www.linkedin.com/in/..."
          label="LinkedIn URL"
          value={url}
          onChange={(event) => setURL(event.currentTarget.value)}
          withAsterisk
          error={
            url.length > 0 &&
            !url.includes("linkedin.com/in/") &&
            !url.includes("linkedin.com/sales/lead/")
              ? "Please submit a valid LinkedIn URL"
              : null
          }
          disabled={loading}
        />
        <Flex justify="flex-end">
          <Button
            mt="md"
            disabled={
              !url ||
              (url.length > 0 &&
                !url.includes("linkedin.com/in/") &&
                !url.includes("linkedin.com/sales/lead/"))
            }
            color="teal"
            w="128px"
            onClick={handleGetDuplicate}
            loading={duplicateLoading}
          >
            Find Duplicate
          </Button>
        </Flex>
        <Flex justify={"flex-end"}>
          {url.length > 0 &&
            (url.includes("linkedin.com/in/") ||
              url.includes("linkedin.com/sales/lead/")) && (
              <Text fz="xs" mt="xs">
                Note: This may take upwards of 1 minute.
              </Text>
            )}
        </Flex>

        {prospectDetails && (
          <Group noWrap spacing={10} align="flex-start" pt="xs">
            <Avatar
              src={proxyURL(prospectDetails.details.profile_pic)}
              size={94}
              radius="md"
            />
            <div>
              <Title order={3}>{prospectDetails.details.full_name}</Title>

              <Group noWrap spacing={10} mt={3}>
                <IconBriefcase
                  stroke={1.5}
                  size={16}
                  className={classes.icon}
                />
                <Text size="xs" color="dimmed">
                  {prospectDetails.details.title}
                </Text>
              </Group>

              <Group noWrap spacing={10} mt={5}>
                <IconSocial stroke={1.5} size={16} className={classes.icon} />
                <Text
                  size="xs"
                  color="dimmed"
                  component="a"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://www.linkedin.com/in/${linkedin_public_id}`}
                >
                  linkedin.com/in/{linkedin_public_id}
                </Text>
              </Group>
            </div>
          </Group>
        )}
      </Flex>
    </>
  );
}
