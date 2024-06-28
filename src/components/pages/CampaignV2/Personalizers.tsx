import { currentProjectState } from "@atoms/personaAtoms";
import { userTokenState } from "@atoms/userAtoms";
import BracketGradientWrapper from "@common/sequence/BracketGradientWrapper";
import { API_URL } from "@constants/data";
import {
  ActionIcon,
  Button,
  Divider,
  Flex,
  Loader,
  Paper,
  Skeleton,
  Switch,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { modals, openContextModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconQuestionMark,
} from "@tabler/icons";
import { fetchCampaignPersonalizers } from "@utils/requests/campaignOverview";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";

export default function Personalizers(props: any) {
  const { statsData } = props;

  const userToken = useRecoilValue(userTokenState);
  const [currentProject, setCurrentProject] = useRecoilState(
    currentProjectState
  );

  const id = currentProject?.id || -1;

  const [loadingPersonalizers, setLoadingPersonalizers] = useState(false);
  const [personalizersEnabled, setPersonalizersEnabled] = useState(
    currentProject?.is_ai_research_personalization_enabled
  );

  const getPersonalizers = async () => {
    setLoadingPersonalizers(true);
    const clientArchetypeId = Number(id);
    const response = await fetchCampaignPersonalizers(
      userToken,
      clientArchetypeId
    );
    if (response) {
      props.setPersonalizers(response.questions);
    }
    setLoadingPersonalizers(false);
  };

  const updatePersonalizersEnabled = (enabled: boolean) => {
    setCurrentProject((prevProject) => {
      if (!prevProject) return prevProject;
      return {
        ...prevProject,
        is_ai_research_personalization_enabled: enabled,
      };
    });
    fetch(`${API_URL}/client/archetype/${id}/update_personalizers_enabled`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        personalizers_enabled: enabled,
      }),
    })
      .then((response) => {
        showNotification({
          title: "Personalizers Updated",
          message: `Personalizers have been ${
            enabled ? "enabled" : "disabled"
          }`,
        });
        setPersonalizersEnabled(enabled);
      })
      .catch((error) => {
        console.error("Error updating personalizers enabled", error);
      });
  };

  useEffect(() => {
    if (id !== -1 && id !== null) {
      getPersonalizers();
    }
  }, [id, currentProject]);

  const deletePersonalizer = (id: number) => {
    setLoadingPersonalizers(true);
    fetch(`${API_URL}/ml/researchers/questions/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          showNotification({
            title: "Personalizer Deleted",
            message: "Personalizer has been deleted.",
            color: "green",
          });
          getPersonalizers();
        } else {
          showNotification({
            title: "Error Deleting Personalizer",
            message: "An error occurred while deleting the personalizer.",
            color: "red",
          });
        }
      })
      .catch((error) => {
        showNotification({
          title: "Error Deleting Personalizer",
          message: "An error occurred while deleting the personalizer.",
          color: "red",
        });
      })
      .finally(() => {
        setLoadingPersonalizers(false);
      });
  };

  useEffect(() => {
    if (currentProject) {
      setPersonalizersEnabled(
        currentProject?.is_ai_research_personalization_enabled
      );
    }
  }, [currentProject]);

  useEffect(() => {
    getPersonalizers();
  }, []);

  return (
    <Paper data-tour="personalizers" withBorder>
      <Flex
        align={"center"}
        justify={"space-between"}
        p={"md"}
        style={{ borderBottom: "1px solid #ECEEF1" }}
      >
        <Flex gap={"sm"} align={"center"}>
          <Flex align="center" gap="xs">
            <Text fw={600} size={20} color="#37414E">
              Personalizers
            </Text>
            <Tooltip
              label={
                <Text size="sm">
                  Create hyper-relevant outreach strategies <br></br>using
                  AI-powered research for personalized engagement.
                </Text>
              }
              withArrow
              position="right"
            >
              <Text color="#37414E" size="xs">
                <IconQuestionMark size={"1rem"} color="#37414E" />
              </Text>
            </Tooltip>
          </Flex>
        </Flex>
        <Flex data-tour="personalizer-enabled" gap={"sm"} align={"center"}>
          <Switch
            labelPosition="left"
            label={
              <Flex gap={"md"} align={"center"}>
                <Text fw={600} size="12px" miw="100px">
                  ✨ Enable Personalizers
                </Text>
              </Flex>
            }
            checked={personalizersEnabled}
            miw={100}
            styles={{
              root: {
                border: "1px solid #D9DEE5",
                padding: "7px",
                borderRadius: "4px",
                background: "white",
              },
              body: {
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
              },
            }}
            onChange={(e) => {
              setPersonalizersEnabled(!personalizersEnabled);
              updatePersonalizersEnabled(e.target.checked);
            }}
          />
          <Button
            leftIcon={<IconPlus size={"0.9rem"} />}
            onClick={() =>
              openContextModal({
                modal: "campaignPersonalizersModal",
                title: <Title order={3}>Personalizers</Title>,
                innerProps: {
                  sequences: props.sequences,
                  ai_researcher_id: statsData?.ai_researcher_id,
                  id,
                  setPersonalizers: props.setPersonalizers,
                },
                centered: true,
                styles: {
                  content: {
                    minWidth: "1100px",
                  },
                },
                onClose: () => {
                  getPersonalizers();
                },
              })
            }
          >
            Add
          </Button>
        </Flex>
      </Flex>
      <Flex>
        {loadingPersonalizers ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            m="auto"
            mt="sm"
          >
            <Skeleton height={30} radius="xl" width="80%" />
            <Skeleton height={20} radius="xl" width="60%" mt="sm" />
            <Skeleton height={20} radius="xl" width="60%" mt="sm" />
            <Flex align="center" gap="sm" mt="sm">
              <Loader color="gray" variant="dots" size="md" />
              <Text color="gray" size="md" className="loading-animation">
                Loading Personalizers
              </Text>
            </Flex>
          </Flex>
        ) : props.personalizers && props.personalizers.length > 0 ? (
          <Flex direction={"column"} w={"100%"}>
            <Flex
              w={"100%"}
              mah={300}
              gap={"md"}
              p={"lg"}
              direction="column"
              sx={{ overflowY: "auto" }}
            >
              {props.personalizers &&
                props.personalizers.length > 0 &&
                props.personalizers.map((item: any, index: number) => {
                  return (
                    <Flex
                      w="100%"
                      justify="space-between"
                      key={index}
                      style={{
                        border: "1px solid #D9DEE5",
                        padding: "7px",
                        borderRadius: "4px",
                        background: "white",
                      }}
                    >
                      <Flex gap={"md"} align={"center"}>
                        <Text fw={600} size="12px" miw="200px">
                          <BracketGradientWrapper>
                            {item.key}
                          </BracketGradientWrapper>
                        </Text>
                      </Flex>
                      <Button
                        size="compact-sm"
                        fw={600}
                        fz="12px"
                        color="red"
                        variant="outline"
                        onClick={() =>
                          modals.openConfirmModal({
                            title: <Title order={4}>Delete Personalizer</Title>,
                            children: (
                              <>
                                <Text>
                                  Deleting this personalizer will remove it from
                                  all sequences and templates. Are you sure you
                                  want to delete it?
                                </Text>
                                <Flex
                                  style={{
                                    fontFamily: "monospace, monospace", // Monospaced font
                                    backgroundColor: "#f5f5f5", // Light grey background
                                    padding: "10px", // Padding inside the block
                                    border: "1px solid #ddd", // Light border
                                    borderRadius: "4px", // Rounded corners
                                    display: "inline-block", // Make sure it wraps content properly
                                    whiteSpace: "pre-wrap", // Preserve whitespace and wrapping
                                    overflowX: "auto", // Horizontal scroll for long lines
                                  }}
                                  mt="md"
                                >
                                  <Text color="red" fz="sm">
                                    {item.key}
                                  </Text>
                                </Flex>
                              </>
                            ),
                            labels: {
                              confirm: "Delete",
                              cancel: "Cancel",
                            },
                            confirmProps: { color: "red" },
                            onCancel: () => {},
                            onConfirm: async () => {
                              await deletePersonalizer(item.id);
                            },
                          })
                        }
                      >
                        Delete
                      </Button>
                    </Flex>
                  );
                })}
            </Flex>
            <Flex
              align={"center"}
              w={"100%"}
              justify={"space-between"}
              p={"md"}
              style={{ borderTop: "1px solid #ECEEF1" }}
            >
              <Flex
                w={"100%"}
                align={"center"}
                justify={"space-between"}
                style={{ border: "1px solid #ced4da" }}
              >
                <Text
                  w={"100%"}
                  align="center"
                  color="gray"
                  size={"sm"}
                  fw={500}
                >
                  {props.personalizers.length}{" "}
                  {props.personalizers.length === 1
                    ? "Personalizer"
                    : "Personalizers"}
                </Text>
                <Divider orientation="vertical" />
                <ActionIcon h={"100%"} mx={3}>
                  <IconChevronLeft size={"1.2rem"} />
                </ActionIcon>
                <Divider orientation="vertical" />
                <ActionIcon h={"100%"} mx={3}>
                  <IconChevronRight size={"1.2rem"} />
                </ActionIcon>
              </Flex>
            </Flex>
          </Flex>
        ) : (
          <Flex
            direction="column"
            align="center"
            justify="center"
            m="lg"
            ml="auto"
            mr="auto"
            sx={(theme) => ({
              border: "2px dotted gray",
              borderRadius: "15px",
              padding: "20px",
              cursor: "pointer",
              transition: "transform 0.2s, background-color 0.2s",
              "&:hover": {
                transform: "scale(1.05)",
                backgroundColor: theme.colors.gray[0],
              },
            })}
            onClick={() => {
              openContextModal({
                modal: "campaignPersonalizersModal",
                title: <Title order={3}>Personalizers</Title>,
                innerProps: {
                  sequences: props.sequences,
                  ai_researcher_id: statsData?.ai_researcher_id,
                  id,
                  setPersonalizers: props.setPersonalizers,
                },
                centered: true,
                styles: {
                  content: {
                    minWidth: "1040px",
                  },
                },
                onClose: () => {
                  getPersonalizers();
                },
              });
            }}
          >
            <Flex align="center" gap="xs">
              <Text color="gray" fw={400} size={"sm"}>
                There are no personalizers here. Add one to get started.
              </Text>
              <ActionIcon>
                <IconPlus size={"1.2rem"} />
              </ActionIcon>
            </Flex>
          </Flex>
        )}
      </Flex>
    </Paper>
  );
}
