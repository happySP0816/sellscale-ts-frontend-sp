import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Tooltip,
  ActionIcon,
  Collapse,
  Avatar,
  Badge,
  Button,
  Switch,
  useMantineTheme,
  Textarea,
} from "@mantine/core";
import {
  IconMessages,
  IconEdit,
  IconTrash,
  IconChevronUp,
  IconChevronDown,
  IconStar,
} from "@tabler/icons";
import BracketGradientWrapper from "@common/sequence/BracketGradientWrapper";
import { IconSparkles } from "@tabler/icons-react";
import { handleAssetCreation } from "@pages/Sequence/InlineTemplateAdder";
import { useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { currentProjectState } from "@atoms/personaAtoms";
import {
  patchSequenceStep,
  postSequenceStepDeactivate,
} from "@utils/requests/emailSequencing";
import { showNotification } from "@mantine/notifications";
import { postBumpDeactivate } from "@utils/requests/postBumpDeactivate";
import RichTextArea from "@common/library/RichTextArea";
import { JSONContent } from "@tiptap/react";
import { patchBumpFramework } from "@utils/requests/patchBumpFramework";
import { API_URL } from "@constants/data";

interface SequenceVariantProps {
  asset: any;
  assetType: string;
  refetch: () => void;
  angle: string;
  text: string;
  assetId: number;
  index: number;
  selectStep: number;
  opened: boolean;
  userImgUrl: string;
  removeFromStagingData: (
    id: number,
    stagingData: any,
    setStagingData: any
  ) => void;
  handleToggle: (index: number) => void;
  stagingData: any;
  setStagingData: any;
  isSaved?: boolean;
  addToStagingData?: (
    data: any,
    stepNum: number,
    stagingData: any,
    setStagingData: any
  ) => void;
  showAll?: boolean;
  sequenceType: string;
  currentStepNum?: number;
  setSuggestionData?: (data: any) => void;
  setAddingLinkedinAsset?: (value: boolean) => void;
  setManuallyAddedTemplate?: (value: string) => void;
}

const SequenceVariant: React.FC<SequenceVariantProps> = (props) => {
  const {
    asset,
    assetType,
    refetch,
    angle,
    text,
    assetId,
    index,
    selectStep,
    opened,
    userImgUrl,
    removeFromStagingData,
    handleToggle,
    stagingData,
    addToStagingData,
    setStagingData,
    isSaved,
    showAll,
    sequenceType,
    currentStepNum,
    setSuggestionData,
    setAddingLinkedinAsset,
    setManuallyAddedTemplate,
  } = props;

  console.log("----------", text);

  const userData = useRecoilValue(userDataState);
  const userToken = useRecoilValue(userTokenState);
  const theme = useMantineTheme();
  const currentProject = useRecoilValue(currentProjectState);

  const [showEditor, setShowEditor] = useState(false);
  const bodyRich = useRef<JSONContent | null>(null);
  const bodyRef = useRef<string | null>(null);
  const [textState, setTextState] = useState<string>(text);

  useEffect(() => {
    setTextState(text);
  }, [text]);

  // const [textState, setTextState] = useState<string>(
  //   assetType === "linkedin" && text.startsWith("<p>") && text.endsWith("</p>")
  //     ? text.slice(3, -4)
  //     : text
  // );

  useEffect(() => {
    if (typeof text === "string") {
      try {
        bodyRich.current = JSON.parse(text);
        bodyRef.current = text;
      } catch (e) {
        console.error("Failed to parse text as JSON", e);
        bodyRich.current = null;
        bodyRef.current = null;
      }
    } else {
      bodyRich.current = text;
      bodyRef.current = JSON.stringify(text);
    }
  }, [text]);

  console.log("current step num: ", currentStepNum);

  return (
    <Box
      mb={"sm"}
      style={{
        backgroundColor: "white",
        border:
          selectStep === index ? "1px solid #228be6" : "1px solid #ced4da",
        borderRadius: "8px",
      }}
    >
      <Flex align={"center"} justify={"space-between"} px={"sm"} py={"xs"}>
        <Flex align={"center"} gap={"xs"}>
          <IconMessages color="#228be6" size={"0.9rem"} />
          <Text color="gray" fw={500} size={"xs"}>
            Variant #{index + 1}:
          </Text>
          <Text fw={600} size={"xs"} ml={"-5px"}>
            {angle}
          </Text>
        </Flex>
        <Flex gap={1} align={"center"}>
          {isSaved && (
            <Badge color="teal" size="xs" mr="6px">
              Saved
            </Badge>
          )}
          <Tooltip label="Edit template" position="top">
            <ActionIcon
              disabled={isSaved === undefined && assetType !== "staging"}
              onClick={() => {
                if (opened) {
                  setShowEditor(!showEditor);
                } else {
                  handleToggle(index);
                  setShowEditor(true);
                }
              }}
              mr="xs"
            >
              <IconEdit size={"0.9rem"} />
            </ActionIcon>
          </Tooltip>

          {(assetType === "email" || assetType === "linkedin") && (
            <Tooltip label="Deactivate" withArrow withinPortal>
              <Flex>
                <Switch
                  checked={asset.active}
                  onClick={async () => {
                    let result;
                    if (assetType === "email") {
                      result = await postSequenceStepDeactivate(
                        userToken,
                        assetId
                      );
                    } else if (assetType === "linkedin") {
                      result = await postBumpDeactivate(
                        userToken,
                        asset.bump_framework_id
                      );
                    }

                    if (result && result.status === "success") {
                      showNotification({
                        title: "Success",
                        message: "Sequence Step deactivated successfully",
                        color: theme.colors.green[7],
                      });
                      refetch();
                    } else {
                      showNotification({
                        title: "Error",
                        message: "Failed to deactivate sequence step",
                        color: theme.colors.red[7],
                      });
                    }
                  }}
                />
              </Flex>
            </Tooltip>
          )}

          {assetType === "staging" && (
            <ActionIcon
              onClick={() => {
                removeFromStagingData(assetId, stagingData, setStagingData);
              }}
              mr="xs"
            >
              <IconTrash size={"0.9rem"} />
            </ActionIcon>
          )}

          {/* Button to add to staging data */}
          {showAll && (
            <Button
              ml={"sm"}
              size="xs"
              color="grape"
              onClick={() => {
                if (addToStagingData) {
                  handleAssetCreation(
                    text,
                    sequenceType || "",
                    userData,
                    userToken,
                    (data, stepNum, stagingData, setStagingData) => {
                      addToStagingData(
                        data,
                        stepNum,
                        stagingData,
                        setStagingData
                      );
                      setSuggestionData &&
                        setSuggestionData((prevData: any) =>
                          prevData.filter((item: any) => item.text !== text)
                        );
                    },
                    currentStepNum || -1,
                    stagingData,
                    setStagingData,
                    setSuggestionData || (() => {}),
                    setAddingLinkedinAsset || (() => {}),
                    setManuallyAddedTemplate || (() => {}),
                    currentProject?.id || -1,
                    true
                  );
                }
              }}
              leftIcon={<IconSparkles size={"0.9rem"} color="white" />}
            >
              Add
            </Button>
          )}
          {!showAll && (
            <ActionIcon onClick={() => handleToggle(index)}>
              {selectStep === index && opened ? (
                <IconChevronUp size={"0.9rem"} />
              ) : (
                <IconChevronDown size={"0.9rem"} />
              )}
            </ActionIcon>
          )}
        </Flex>
      </Flex>
      <Collapse
        in={(selectStep === index && opened) || showAll || false}
        key={index}
      >
        <Flex gap={"sm"} p={"sm"} style={{ borderTop: "1px solid #ced4da" }}>
          <Avatar src={userImgUrl} size={"md"} radius={"xl"} />
          {showEditor ? (
            assetType === "email" ? (
              <Flex direction="column" style={{ width: "100%" }}>
                <RichTextArea
                  onChange={(value, rawValue) => {
                    bodyRich.current = rawValue;
                    bodyRef.current = value;
                  }}
                  value={textState}
                  height={250}
                />
                <Flex justify="flex-end" mt="xs">
                  <Button
                    size="xs"
                    color="teal"
                    onClick={() => {
                      patchSequenceStep(
                        userToken,
                        assetId,
                        "active",
                        angle,
                        bodyRef.current || "",
                        null,
                        false
                      );
                      setShowEditor(false);
                      setTextState(bodyRef.current || "");
                      console.log("Save button clicked");
                    }}
                  >
                    Save
                  </Button>
                </Flex>
              </Flex>
            ) : assetType === "linkedin" ? (
              <Flex direction="column" style={{ width: "100%" }}>
                <Textarea
                  onChange={(event) => {
                    bodyRef.current = event.currentTarget.value;
                    setTextState(event.currentTarget.value);
                  }}
                  value={textState}
                  minRows={10}
                />
                <Flex justify="flex-end" mt="xs">
                  <Button
                    size="xs"
                    color="teal"
                    onClick={async () => {
                      await patchBumpFramework(
                        userToken, // User token for authentication
                        asset.bump_framework_id || asset.id, // Bump framework ID
                        asset.overall_status, // Overall status
                        asset.title, // Title
                        bodyRef.current || asset.description, // Description
                        asset.length, // Length (positional argument)
                        asset.bumped_count, // Bumped count (positional argument)
                        2, // Bump delay days (positional argument)
                        asset.active, // Set active
                        true, // Set use account research
                        undefined, // Blocklist (optional)
                        null, // Additional context (optional)
                        null, // Bump framework template name (optional)
                        null, // Bump framework human readable prompt (optional)
                        null,
                        currentStepNum || currentStepNum === 0
                          ? currentStepNum
                          : undefined
                      );
                      setShowEditor(false);
                      setTextState(bodyRef.current || "");
                      refetch();
                    }}
                  >
                    Save
                  </Button>
                </Flex>
              </Flex>
            ) : assetType === "staging" ? (
              <Flex direction="column" style={{ width: "100%" }}>
                <Textarea
                  onChange={(event) => {
                    bodyRef.current = event.currentTarget.value;
                    setTextState(event.currentTarget.value);
                  }}
                  value={textState}
                  minRows={10}
                />
                <Flex justify="flex-end" mt="xs">
                  <Button
                    size="xs"
                    color="teal"
                    onClick={async () => {
                      console.log("asset is", asset);
                      // console.log('item in staging data is: ', stagingData[assetType].find((item: any) => item.id === assetId));
                      setShowEditor(false);
                      setTextState(bodyRef.current || "");

                      // Update the staging data with the new text
                      console.log("staging data is", stagingData);
                      const updatedStagingData = {
                        ...stagingData,
                        [sequenceType]:
                          stagingData[sequenceType]?.map((item: any) =>
                            item.id === assetId
                              ? {
                                  ...item,
                                  text: textState || "",
                                  angle: asset.angle,
                                  assets: asset.assets,
                                  step_num: asset.step_num,
                                }
                              : item
                          ) || [],
                      };
                      setStagingData(updatedStagingData);

                      // Call the fetch to update the asset on the server
                      if (sequenceType === "linkedin") {
                        try {
                          const response = await fetch(
                            `${API_URL}/client/update_asset`,
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${userToken}`,
                              },
                              body: JSON.stringify({
                                asset_id: asset.assets[0],
                                asset_key: asset.angle,
                                asset_value: bodyRef.current || "",
                                asset_raw_value: bodyRef.current || "",
                                asset_type: "TEXT",
                                asset_tags: asset.asset_tags,
                              }),
                            }
                          );

                          if (!response.ok) {
                            throw new Error("Failed to update asset");
                          }

                          console.log("Asset updated successfully");
                        } catch (error) {
                          console.error("Error updating asset:", error);
                        }
                      }
                      console.log("Save button clicked");
                    }}
                  >
                    Save
                  </Button>
                </Flex>
              </Flex>
            ) : null
          ) : (
            <Box>
              <div style={{ fontSize: "11px" }}>
                <BracketGradientWrapper>{textState}</BracketGradientWrapper>
              </div>
            </Box>
          )}
        </Flex>
      </Collapse>
    </Box>
  );
};

export default SequenceVariant;
