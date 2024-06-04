import { userDataState, userTokenState } from "@atoms/userAtoms";
import RichTextArea from "@common/library/RichTextArea";
import { API_URL } from "@constants/data";
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Center,
  Collapse,
  Divider,
  Flex,
  Modal,
  Tooltip,
  NumberInput,
  Paper,
  ScrollArea,
  SegmentedControl,
  Select,
  Switch,
  Text,
  Title,
  TextInput,
  Badge,
  Tabs,
  Card,
  Alert,
  Popover,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ContextModalProps, openContextModal, closeAllModals } from "@mantine/modals";
import { MantineStyleSystemProps } from "@mantine/styles";

import {
  IconArrowRight,
  IconChevronDown,
  IconChevronUp,
  IconEdit,
  IconMessages,
  IconPlus,
  IconPoint,
  IconRefresh,
  IconSearch,
  IconTrash,
} from "@tabler/icons";
import { addSequence } from "@utils/requests/generateSequence";
import { deterministicMantineColor } from "@utils/requests/utils";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

interface SwitchStyle extends Partial<MantineStyleSystemProps> {
  label?: React.CSSProperties;
  root?: React.CSSProperties;
}

type AssetType = {
  asset_key: string;
  asset_raw_value: string;
  asset_tags: string[];
  asset_type: string;
  asset_value: string;
  client_archetype_ids: number[];
  client_id: number;
  id: number;
  num_opens: number | null;
  num_replies: number | null;
  num_sends: number | null;
};

export default function CampaignTemplateEditModal({
  innerProps,
  context,
  id,
}: ContextModalProps<{
  stagingData: any;
  refetchSequenceData: Function;
  addedTemplate?: AssetType | null;
  currentStepNum: any;
  createTemplateBuilder: boolean;
  setCreateTemplateBuilder: Function;
  // setSequences: Function;
  campaignId: number;
  cType?: string;
}>) {
  const [templateType, setTemplateType] = useState("template" || "generate");
  const [sequenceType, setSequenceType]: any = useState<string>("email");
  const [steps, setSteps] = useState(3);
  console.log('innerProps are', innerProps)
  const [currentStepNum, setCurrentStepNum] = useState(innerProps.currentStepNum || 1 || null);
  const [generateSequence, setGenerateSequence] = useState(false);
  const [openid, setOpenId] = useState<number>(0);
  const [opened, setOpened] = useState(false);
  const [selectStep, setSelectStep] = useState<number | null>(null);
  const [assets, setAssets] = useState<AssetType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  console.log('template added was', innerProps.addedTemplate)
  const [addedTemplate, setAddedTemplate] = useState<AssetType | null>(innerProps.addedTemplate || null);

  const addToStagingData = (asset: AssetType, step_num: number, stagingData: any, setStagingData: any) => {
    console.log("Adding to " + sequenceType + " staging data");
    console.log('params are', asset, step_num, stagingData, setStagingData)
    const type = sequenceType;
    const angle = asset.asset_key;
    const text = asset.asset_raw_value;
    const assets = [asset.id];
    const randomId = Math.floor(Math.random() * 1000000);

    const newStagingData = {
      angle,
      text,
      step_num,
      assets,
      id: randomId,
    };

    const newStagingDataArray = Array.isArray(stagingData[type]) ? [...stagingData[type]] : [];
    newStagingDataArray.push(newStagingData);

    setStagingData({
      ...stagingData,
      [type]: newStagingDataArray,
    });

    console.log(stagingData);
  };

  const removeFromStagingData = (randomId: number, stagingData: any, setStagingData: any) => {
    console.log("Removing from " + sequenceType + " staging data");
    const type = sequenceType;

    // Filter out the asset from the staging data based on randomId
    const filteredStagingData = stagingData[type].filter(
      (item: any) => item.id !== randomId
    );

    // Update the staging data state
    setStagingData({
      ...stagingData,
      [type]: filteredStagingData,
    });

    console.log(stagingData);
  };

  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);
  const campaignId = innerProps.campaignId;
  const [stagingData, setStagingData] = useState(innerProps.stagingData || {'TEXT':[]});

  const data = [
    {
      title: "Personalized Opener",
      avatar: "",
      name: "Ishan Sharma",
      message:
        "Hey Shadi! Impressed by your track record of scaling businesses and building strong teams, not to mention your transformative approach to customer conversations. Given your experience as an executive leader in Saas and laas, I'm curious if you'd be interested in exploring opportunities at SellScale? Let's  connect and chat more about it!",
      point_used: 14,
      asset_used: 14,
      opened: 12,
      replied: 4.6,
    },
    {
      title: "Personalized Opener",
      avatar: "",
      name: "Ishan Sharma",
      message:
        "Hey Shadi! Impressed by your track record of scaling businesses and building strong teams, not to mention your transformative approach to customer conversations. Given your experience as an executive leader in Saas and laas, I'm curious if you'd be interested in exploring opportunities at SellScale? Let's  connect and chat more about it!",
      point_used: 14,
      asset_used: 14,
      opened: 12,
      replied: 4.6,
    },
    {
      title: "Personalized Opener",
      avatar: "",
      name: "Ishan Sharma",
      message:
        "Hey Shadi! Impressed by your track record of scaling businesses and building strong teams, not to mention your transformative approach to customer conversations. Given your experience as an executive leader in Saas and laas, I'm curious if you'd be interested in exploring opportunities at SellScale? Let's  connect and chat more about it!",
      point_used: 14,
      asset_used: 14,
      opened: 12,
      replied: 4.6,
    },
  ];

  const handleToggle = (key: number) => {
    if (selectStep === key) {
      setOpened(!opened);
    } else {
      setOpened(true);
      setSelectStep(key);
    }
    setSelectStep(key);
  };

  const getAllAssets = async () => {
    fetch(`${API_URL}/client/get_assets`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const filteredAssets = data.data.filter(
          (asset: AssetType) =>
            asset.asset_tags.includes("email template") ||
            asset.asset_tags.includes("linkedin template")
        );

        setAssets(filteredAssets);
      });
  };

  useEffect(() => {
    getAllAssets();
  }, []);

  const [isBuilder, setIsBuilder] = useState(innerProps.createTemplateBuilder);
  useEffect(() => {
    setIsBuilder(innerProps.createTemplateBuilder);
  }, [innerProps.createTemplateBuilder]);

  // Function to toggle the builder view
  const toggleBuilder = () => {
    const newBuilderState = !isBuilder;
    setIsBuilder(newBuilderState); // Update local state to force re-render
    innerProps.setCreateTemplateBuilder(newBuilderState); // Update parent state
  };

  const readyToGenerate = !sequenceType || !steps;
  const filteredAssets = assets.filter((asset) =>
    sequenceType === "linkedin"
      ? asset.asset_tags.includes("linkedin template")
      : asset.asset_tags.includes("email template")
  );

  return (
    <div key={innerProps.createTemplateBuilder ? "builder" : "template"}>
      {isBuilder ? (
        <>
          <Paper withBorder>
            <Flex direction={"column"}>
              <Flex p={"lg"} style={{ borderBottom: "1px solid #dee2e6" }}>
                <Text fw={600}>Mass Import Research</Text>
              </Flex>
              <Flex
                direction={"column"}
                p={"lg"}
                mt={"sm"}
                gap={"sm"}
                style={{ borderBottom: "1px solid #dee2e6" }}
                pb={70}
              >
                <Box>
                  <Text size={"xs"} fw={500}>
                    Raw Data
                  </Text>
                  <Text size={"xs"} fw={500} color="gray">
                    Past in case studies, phrases, email templates, or others.
                  </Text>
                  <Box mt={4}>
                    <RichTextArea height={200} />
                  </Box>
                </Box>
                <Flex direction={"column"} gap={"sm"}>
                  <Text size={"xs"} fw={500}>
                    Asset Extraction (Optional)
                  </Text>
                  <Flex gap={"xl"} justify={"space-between"}>
                    <Flex gap={"sm"} align={"center"} w={"100%"}>
                      <Switch
                        labelPosition="left"
                        label={"Value Props"}
                        w={"100%"}
                        styles={{
                          root: {
                            border: "1px solid #D9DEE5",
                            padding: "7px",
                            borderRadius: "4px",
                          },
                          body: {
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                          },
                        }}
                      />
                      <NumberInput w={200} placeholder="Amount" />
                    </Flex>
                    <Flex gap={"sm"} align={"center"} w={"100%"}>
                      <Switch
                        labelPosition="left"
                        label={"Offers"}
                        w={"100%"}
                        styles={{
                          root: {
                            border: "1px solid #D9DEE5",
                            padding: "7px",
                            borderRadius: "4px",
                          },
                          body: {
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                          },
                        }}
                      />
                      <NumberInput w={200} placeholder="Amount" />
                    </Flex>
                  </Flex>
                  <Flex gap={"xl"} justify={"space-between"}>
                    <Flex gap={"sm"} align={"center"} w={"100%"}>
                      <Switch
                        labelPosition="left"
                        label={"Pain Points"}
                        w={"100%"}
                        styles={{
                          root: {
                            border: "1px solid #D9DEE5",
                            padding: "7px",
                            borderRadius: "4px",
                          },
                          body: {
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                          },
                        }}
                      />
                      <NumberInput w={200} placeholder="Amount" />
                    </Flex>
                    <Flex gap={"sm"} align={"center"} w={"100%"}>
                      <Switch
                        labelPosition="left"
                        label={"Social Proof"}
                        w={"100%"}
                        styles={{
                          root: {
                            border: "1px solid #D9DEE5",
                            padding: "7px",
                            borderRadius: "4px",
                          },
                          body: {
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                          },
                        }}
                      />
                      <NumberInput w={200} placeholder="Amount" />
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
              <Flex justify={"end"} p={"lg"} gap={"lg"}>
                <Button
                  variant="outline"
                  color="gray"
                  fullWidth
                  onClick={toggleBuilder}
                >
                  Go Back
                </Button>
                <Button fullWidth>Generate Assets</Button>
              </Flex>
            </Flex>
          </Paper>
        </>
      ) : (
        <Flex gap={"md"} mt={"lg"}>
          <Paper
            withBorder
            p={"lg"}
            w={"35%"}
            display={"flex"}
            style={{ gap: "16px", flexDirection: "column" }}
          >
            <Flex align={"center"} justify={"space-between"}>
              <Text size={'xs'} fw={600}>{userData.client_name}'s Templates</Text>
              <SegmentedControl
                value={templateType}
                onChange={(value: any) => {
                  setTemplateType(value);
                }}
                data={[
                  {
                    value: "template",
                    label: (
                      <Center style={{ gap: 10 }}>
                        <Text fw={500}>Templates</Text>
                      </Center>
                    ),
                  },
                  {
                    value: "generate",
                    disabled: true,
                    label: (
                      <Center style={{ gap: 10 }}>
                        <Text fw={500}>Generator</Text>
                      </Center>
                    ),
                  },
                ]}
              />
            </Flex>
            <TextInput
              variant="filled"
              placeholder="Search"
              icon={<IconSearch size={"0.9rem"} color="gray" />}
              onChange={(event) => setSearchQuery(event.currentTarget.value)}
            />
            {templateType === "template" ? (
              <>
              <Button
                variant="light"
                leftIcon={<IconPlus size={"0.9rem"} />}
                onClick={() =>
                  openContextModal({
                    modal: "campaignTemplates",
                    title: (
                      <Title order={3}>
                        Add Template
                      </Title>
                    ),
                    innerProps: {
                      stagingData,
                        refetchSequenceData: innerProps.refetchSequenceData,
                        currentStepNum,
                        createTemplateBuilder: innerProps.createTemplateBuilder,
                        setCreateTemplateBuilder: innerProps.setCreateTemplateBuilder,
                        setSequences: innerProps.setSequences,
                        campaignId: innerProps.campaignId,
                        cType: innerProps.cType,
                        setStagingData: setStagingData,
                        addToStagingData: addToStagingData,
                        setAddedTemplate: setAddedTemplate,
                    },
                    centered: true,
                    styles: {
                      content: {
                        minWidth: "800px",
                      },
                    },
                    onClose: () => {
                      closeAllModals();
                      //nasty hack to preserve the added templates
                      console.log('previous assets are', assets)
                      console.log('added template is', addedTemplate)
                      openContextModal({
                        modal: "campaignTemplateEditModal",
                        title: <Title order={3}>Sequence Builder</Title>,
                        innerProps: {
                          stagingData,
                            refetchSequenceData: innerProps.refetchSequenceData,
                            currentStepNum,
                            createTemplateBuilder: innerProps.createTemplateBuilder,
                            setCreateTemplateBuilder: innerProps.setCreateTemplateBuilder,
                            setSequences: innerProps.setSequences,
                            campaignId: innerProps.campaignId,
                            cType: innerProps.cType,
                            setAddedTemplate: setAddedTemplate,
                        },
                        centered: true,
                        styles: {
                          content: {
                            minWidth: "1100px",
                          },
                        },
                        onClose: () => {
                          const clientArchetypeId = Number(id);
                          innerProps.refetchSequenceData(clientArchetypeId);
                        },
                      });
                    },
                  })
                }
              >
                Create New
              </Button>
              <Templates
                readyToGenerate={readyToGenerate}
                assets={filteredAssets}
                searchQuery={searchQuery}
                addToStagingData={addToStagingData}
                removeFromStagingData={removeFromStagingData}
                stagingData={stagingData}
                setStagingData={setStagingData}
                currentStepNum={currentStepNum}
                setCurrentStepNum={setCurrentStepNum}
              />
              </>
            ) : (
              <Generates />
            )}
          </Paper>
          <Paper
            withBorder
            w={"66%"}
            display={"flex"}
            style={{ flexDirection: "column" }}
          >
            <Flex
              p={"lg"}
              align={"end"}
              gap={"sm"}
              style={{ borderBottom: "1px solid #DEE2E6" }}
            >
              <Select
                label="Sequence Type"
                placeholder="Select Sequence type"
                value={sequenceType || ""}
                onChange={(value) => setSequenceType(value)}
                data={[
                  { label: "Linkedin", value: "linkedin" },
                  { label: "Email", value: "email" },
                ]}
              />
              <NumberInput
                w={120}
                label="No. of Steps"
                onChange={(val: any) => setSteps(val)}
                value={steps || undefined}
                max={5}
              />
              {templateType === "generate" && (
                <Button
                  rightIcon={<IconArrowRight size={"0.9rem"} />}
                  onClick={() => setGenerateSequence(true)}
                >
                  Generate Sequence
                </Button>
              )}
            </Flex>
            {readyToGenerate && (
              <Alert
                color="yellow"
                title="Please select a sequence type and steps"
                p={"xs"}
                m="md"
              >
                <Text size="sm" color="gray" mt="0">
                  Please select a sequence type and steps to proceed
                </Text>
              </Alert>
            )}
            <Tabs
              defaultValue="1"
              onTabChange={(value) => setCurrentStepNum(Number(value))}
              styles={{
                tabsList: {
                  background: "#ECEEF1",
                  padding: "8px",
                },
              }}
            >
              <Tabs.List>
                {steps &&
                  Array.from({ length: Number(steps) }, (_, index) => {
                    return (
                      <Tabs.Tab value={(index + 1).toString()}>
                        Step {index + 1} (
                        {stagingData[sequenceType]?.filter(
                          (asset: any) => asset.step_num === index + 1
                        ).length == 0
                          ? "🔴 "
                          : "🟢 "}
                        {
                          stagingData[sequenceType]?.filter(
                            (asset: any) => asset.step_num === index + 1
                          ).length
                        }
                        )
                      </Tabs.Tab>
                    );
                  })}
              </Tabs.List>

              {steps &&
                Array.from({ length: Number(steps) }, (_, index) => {
                  return (
                    <Tabs.Panel value={(index + 1).toString()}>
                      {" "}
                      <ScrollArea h={350}>
                        <Flex p={"lg"} h={"100%"} direction={"column"}>
                          <>
                            {stagingData[sequenceType]?.filter(
                                (asset: any) => asset.step_num === index + 1
                              )
                              .map((asset: any, index: number) => {
                                return (
                                  <Box
                                    mb={"sm"}
                                    style={{
                                      border:
                                        selectStep === index
                                          ? "1px solid #228be6"
                                          : "1px solid #ced4da",
                                      borderRadius: "8px",
                                    }}
                                  >
                                    <Flex
                                      align={"center"}
                                      justify={"space-between"}
                                      px={"sm"}
                                      py={"xs"}
                                    >
                                      <Flex align={"center"} gap={"xs"}>
                                        <IconMessages
                                          color="#228be6"
                                          size={"0.9rem"}
                                        />
                                        <Text color="gray" fw={500} size={"xs"}>
                                          Variant #{index + 1}:
                                        </Text>
                                        <Text fw={600} size={"xs"} ml={"-5px"}>
                                          {asset.angle}
                                        </Text>
                                      </Flex>
                                      <Flex gap={1} align={"center"}>
                                        <Tooltip
                                          label="Editing coming soon"
                                          position="top"
                                        >
                                          <ActionIcon disabled>
                                            <IconEdit size={"0.9rem"} />
                                          </ActionIcon>
                                        </Tooltip>
                                        <ActionIcon
                                          onClick={() =>
                                            removeFromStagingData(asset.id, stagingData, setStagingData)
                                          }
                                        >
                                          <IconTrash size={"0.9rem"} />
                                        </ActionIcon>
                                        <ActionIcon
                                          onClick={() => {
                                            handleToggle(index);
                                          }}
                                        >
                                          {selectStep === index && opened ? (
                                            <IconChevronUp size={"0.9rem"} />
                                          ) : (
                                            <IconChevronDown size={"0.9rem"} />
                                          )}
                                        </ActionIcon>
                                      </Flex>
                                    </Flex>
                                    <Collapse
                                      in={selectStep === index && opened}
                                      key={index}
                                    >
                                      <Flex
                                        gap={"sm"}
                                        p={"sm"}
                                        style={{
                                          borderTop: "1px solid #ced4da",
                                        }}
                                      >
                                        <Avatar size={"md"} radius={"xl"} />
                                        <Box>
                                          {/* <Text fw={600} size={"sm"}>
                                            {"Ishan Sharma"}
                                          </Text> */}
                                          <div
                                            style={{
                                              fontSize: "11px",
                                            }}
                                            dangerouslySetInnerHTML={{
                                              __html: asset.text,
                                            }}
                                          />
                                        </Box>
                                      </Flex>
                                    </Collapse>
                                  </Box>
                                );
                              })}
                          </>
                        </Flex>
                      </ScrollArea>
                    </Tabs.Panel>
                  );
                })}
            </Tabs>

            <Flex
              gap={"md"}
              p={"lg"}
              style={{ borderTop: "1px solid #dee2e6" }}
            >
              <Button fullWidth variant="outline">
                Reset
              </Button>
              <Button
                fullWidth
                loading={loading}
                onClick={() => {
                  // innerProps.setSequences(data);
                  console.log(stagingData[sequenceType]);
                  // context.closeModal(id);
                  setLoading(true);
                  console.log("Adding to sequence");

                  let addType = "";
                  if (sequenceType === "linkedin") {
                    addType = "LINKEDIN-TEMPLATE";
                  } else {
                    addType = "EMAIL";
                  }

                  console.log(stagingData[sequenceType]);
                  console.log(addType);
                  addSequence(
                    userToken,
                    userData?.client?.id,
                    campaignId,
                    addType,
                    [],
                    stagingData[sequenceType]
                  ).finally(() => {
                    setLoading(false);
                    context.closeModal(id);
                  });
                }}
              >
                Add to Sequence
              </Button>
            </Flex>
          </Paper>
        </Flex>
      )}
    </div>
  );
}

export const Templates = ({
  readyToGenerate,
  assets,
  searchQuery,
  addToStagingData,
  stagingData,
  setStagingData,
  removeFromStagingData,
  currentStepNum,
  setCurrentStepNum,
}: {
  readyToGenerate: boolean;
  assets: AssetType[];
  searchQuery: string;
  addToStagingData: Function;
  removeFromStagingData: Function;
  stagingData: any;
  setStagingData: Function;
  currentStepNum: number;
  setCurrentStepNum: Function;
}) => {
  const switchStyle = {
    root: {
      border: "1px solid #D9DEE5",
      padding: "12px",
      borderRadius: "4px",
    },
    label: {
      textOverflow: "ellipsis",
      overflow: "hidden",
      whiteSpace: "nowrap",
      width: "100%",
    },
  };

  return (
    <>
      <Flex
        direction={"column"}
        gap={"xs"}
        sx={{ maxHeight: 500, overflowY: "scroll" }}
      >
        {assets
          .filter(
            (asset) =>
              asset.asset_key.includes(searchQuery) ||
              asset.asset_tags.join(" ").includes(searchQuery) ||
              !searchQuery
          )
          .map((asset) => {
            return (
              <Card withBorder mih={"90px"}>
                <Flex>
                  <Popover withinPortal>
                    <Popover.Dropdown>
                      <div
                        style={{
                          maxWidth: "300px",
                          fontSize: "14px", // Increased font size for bigger text
                          fontWeight: "bold", // Make the text bold
                        }}
                        dangerouslySetInnerHTML={{
                          __html: asset.asset_key, // Display the asset in bigger text
                        }}
                      />
                      <div
                        style={{
                          maxWidth: "300px",
                          fontSize: "10px",
                        }}
                        dangerouslySetInnerHTML={{
                          __html: asset.asset_raw_value,
                        }}
                      />
                    </Popover.Dropdown>
                    <Popover.Target>
                      <Box w={"90%"}>
                        <Flex gap={6}>
                          {asset.asset_tags
                            .filter((tag) => tag !== "email template")
                            .filter((tag) => tag !== "linkedin template")
                            .map((tag) => {
                              return (
                                <Badge
                                  size="sm"
                                  radius={"sm"}
                                  color={deterministicMantineColor(tag)}
                                >
                                  {tag}
                                </Badge>
                              );
                            })}
                        </Flex>
                        <Text mt={3} size={"sm"} fw={500} className="truncate">
                          {asset.asset_key.substring(0, 30)}
                          {asset.asset_key.length > 30 ? "..." : ""}
                        </Text>
                        <Text color="gray" mt={3} size={"xs"} fw={400} className="truncate" sx={{ cursor: 'pointer' }}>
                          {asset.asset_value.replace(/<[^>]*>/g, "").substring(0, 40)}
                          {asset.asset_value.replace(/<[^>]*>/g, "").length > 40 ? "..." : ""}
                        </Text>
                      </Box>
                    </Popover.Target>
                  </Popover>
                  <Button
                    size="xs"
                    compact
                    variant="outline"
                    color="blue"
                    disabled={readyToGenerate}
                    onClick={() => {
                      addToStagingData(asset, currentStepNum, stagingData, setStagingData);
                    }}
                  >
                    Add
                  </Button>
                </Flex>
              </Card>
            );
          })}
      </Flex>
    </>
  );
};

export const Generates = () => {
  return (
    <>
      <Flex direction={"column"} gap={"xs"}>
        <Divider
          label={
            <Flex align={"center"}>
              <IconPoint
                fill="#EB8231"
                color="white"
                size={"2rem"}
                className="mb-[2px]"
              />
              <Text tt={"uppercase"}>case study</Text>
            </Flex>
          }
          labelPosition="left"
        />
        <Switch
          labelPosition="left"
          label={"43% pf SDRs turn out within the first year."}
          styles={{
            root: {
              border: "1px solid #D9DEE5",
              padding: "12px",
              borderRadius: "4px",
            },
            label: {
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              width: "240px",
            },
          }}
        />
        <Switch
          labelPosition="left"
          label={"43% pf SDRs turn out within the first year."}
          styles={{
            root: {
              border: "1px solid #D9DEE5",
              padding: "12px",
              borderRadius: "4px",
            },
            label: {
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              width: "240px",
            },
          }}
        />
      </Flex>
      <Flex direction={"column"} gap={"xs"}>
        <Divider
          label={
            <Flex align={"center"}>
              <IconPoint
                fill="#3B85EF"
                color="white"
                size={"2rem"}
                className="mb-[2px]"
              />
              <Text tt={"uppercase"}>value props</Text>
            </Flex>
          }
          labelPosition="left"
        />
        <Switch
          labelPosition="left"
          label={"43% pf SDRs turn out within the first year."}
          styles={{
            root: {
              border: "1px solid #D9DEE5",
              padding: "12px",
              borderRadius: "4px",
            },
            label: {
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              width: "240px",
            },
          }}
        />
        <Switch
          labelPosition="left"
          label={"43% pf SDRs turn out within the first year."}
          styles={{
            root: {
              border: "1px solid #D9DEE5",
              padding: "12px",
              borderRadius: "4px",
            },
            label: {
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              width: "240px",
            },
          }}
        />
      </Flex>
      <Flex direction={"column"} gap={"xs"}>
        <Divider
          label={
            <Flex align={"center"}>
              <IconPoint
                fill="#E74B41"
                color="white"
                size={"2rem"}
                className="mb-[2px]"
              />
              <Text tt={"uppercase"}>offers</Text>
            </Flex>
          }
          labelPosition="left"
        />
        <Switch
          labelPosition="left"
          label={"43% pf SDRs turn out within the first year."}
          styles={{
            root: {
              border: "1px solid #D9DEE5",
              padding: "12px",
              borderRadius: "4px",
            },
            label: {
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              width: "240px",
            },
          }}
        />
        <Switch
          labelPosition="left"
          label={"43% pf SDRs turn out within the first year."}
          styles={{
            root: {
              border: "1px solid #D9DEE5",
              padding: "12px",
              borderRadius: "4px",
            },
            label: {
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              width: "240px",
            },
          }}
        />
      </Flex>
    </>
  );
};
