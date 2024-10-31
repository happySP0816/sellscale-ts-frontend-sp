import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Group,
  List,
  LoadingOverlay,
  Modal,
  Radio,
  Stack,
  Switch,
  Text,
  TextInput,
  Textarea,
  useMantineTheme,
} from "@mantine/core";
import {
  IconCloudUpload,
  IconEdit,
  IconFileSpreadsheet,
  IconLayoutBoard,
  IconList,
  IconPlus,
  IconTrash,
  IconUpload,
  IconX,
} from "@tabler/icons";
import { IconArrowRight, IconBulb, IconToggleRight } from "@tabler/icons";
import { useDisclosure } from "@mantine/hooks";
import { IconSparkles } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import CardView from "./CardView";
import ListView from "./ListView";
import { API_URL } from "@constants/data";
import { useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { showNotification } from "@mantine/notifications";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ThreadType } from "@pages/AIBrain/SelinAI";

export type AssetType = {
  asset_key: string;
  asset_raw_value: string | null;
  created_at: Date;
  asset_tag: string;
  asset_type: "PDF" | "URL" | "TEXT";
  asset_value: string;
  client_archetype_ids: number[] | null;
  client_id: number;
  id: number;
  num_opens: number;
  num_replies: number;
  num_sends: number;
  is_baseline_asset: boolean;
  is_new_asset: boolean;
  selix_sessions_in_use: number[];
};

export default function AssetLibraryV2() {
  const [opened, { open, close }] = useDisclosure(false);
  const [openedAsset, { open: openAsset, close: closeAsset }] =
    useDisclosure(false);
  const theme = useMantineTheme();
  const isSelix = window.location.href.includes("selix");

  const [viewType, setViewType] = useState("card");
  const [tabs, setTabs] = useState("non_generative");
  const [semiTabs, setSemiTabs] = useState("");
  const userToken = useRecoilValue(userTokenState);
  const [loading, setLoading] = useState(false);
  const userData = useRecoilValue(userDataState);
  const MAX_FILE_SIZE_MB = 2;
  const [preview, setPreview] = useState(false);

  const [ingestionType, setIngestionType] = useState<
    "PDF" | "URL" | "TEXT" | "IMAGE" | ""
  >("");
  const [assetType, setAssetType] = useState<
    | "subject line"
    | "email template"
    | "linkedin"
    | "CTO"
    | "Intro email"
    | "Small startups"
    | "hello world"
    | "Healthcare intro"
    | "LinkedIn Template"
    | "email"
    | "Solution Based"
    | "Research"
    | "Template-test"
    | "brand"
    | "LinkedIn CTA"
    | "Supply Chain"
    | "Intro"
    | "Pain Based"
    | "PTAL"
    | "pain-based"
    | "need-based"
    | "pain based"
    | "first email (v2)"
    | "Pain-Based"
    | "FOMO Based"
    | "Phrase"
    | "linkedin template"
    | "Offer"
    | "CTA"
    | "smile based"
    | "e"
    | null
    | "Social Proof"
    | "Pain Point"
    | "CRM Based"
    | "test"
    | "Value Prop"
    | "Case Study"
    | "Testimonial"
    | "Quote"
    | "How It Works"
    | "Email Template"
    | "followup"
    | "email 2"
    | "E2"
    | "Social Proof Based"
    | "GCP_EMAIL_1"
    | "message 1"
    | "affiliate marketing"
    | "Dan-Approved"
  >(null);
  const [assetName, setAssetName] = useState("");
  const [assetValue, setAssetValue] = useState("");
  const [editSummary, setEditSummary] = useState(false);
  const [summary, setSummary] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [sessionAssets, setSessionAssets] = useState<AssetType[]>([]);
  const [baselineAssets, setBaselineAssets] = useState<AssetType[]>([]);
  const [otherAssets, setOtherAssets] = useState<AssetType[]>([]);

  const filterData = (data: AssetType[]) => {
    switch (semiTabs) {
      case "offers":
        return data.filter((asset) => asset.asset_tag.includes("Offer"));
      case "phrases":
        return data.filter((asset) => asset.asset_tag.includes("Phrase"));
      case "study":
        return data.filter((asset) => asset.asset_tag.includes("Case Study"));
      case "research":
        return data.filter((asset) => asset.asset_tag.includes("Research"));
      case "email_subject_lines":
        return data.filter((asset) => asset.asset_tag.includes("subject line"));
      case "linkedin_cta":
        return data.filter((asset) => asset.asset_tag.includes("LinkedIn CTA"));
      case "cta":
        return data.filter((asset) => asset.asset_tag.includes("CTA"));
      case "email_templates":
        return data.filter((asset) =>
          asset.asset_tag.includes("email template")
        );
      case "linkedin_templates":
        return data.filter((asset) =>
          asset.asset_tag.includes("linkedin template")
        );
      default:
        return data;
    }
  };

  const filteredSessionAssets = filterData(sessionAssets);
  const filteredBaselineAssets = filterData(baselineAssets);
  const filteredOtherAssets = filterData(otherAssets);

  const location = useLocation();

  const [queryParams, setQueryParams] = useState(
    new URLSearchParams(location.search)
  );

  useEffect(() => {
    // Update the queryParams state when the location changes
    setQueryParams(new URLSearchParams(location.search));
  }, [location]);

  const { data: session, refetch } = useQuery({
    queryKey: ["selix-session", queryParams.get("session_id")],
    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/selix/get_session/${queryParams.get("session_id")}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
            ContentType: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch specific session.");
      }

      const result = await response.json();

      return result.data as ThreadType;
    },
    enabled: !!queryParams.get("session_id"),
  });

  useEffect(() => {
    fetchAllAssets();
  }, []);
  const toggleIngestionMode = async () => {
    setLoading(true);
    const response = await fetch(`${API_URL}/selix/toggle_ingestion_mode`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: queryParams.get("session_id")
          ? +queryParams.get("session_id")!
          : -1,
        is_ingestion_mode: !session?.is_ingestion_session,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to toggle ingestion mode.");
    }

    refetch();
    setLoading(false);
  };
 
  const fetchAllAssets = async () => {
    try {
      setLoading(true);
      const is_selix_in_url = window.location.href.includes("selix");
      if (is_selix_in_url) {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get("session_id");
      }
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get("session_id");
      const response = await fetch(`${API_URL}/client/all_assets_in_client`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      const result = await response.json();
      if (result.message === "Success") {
        const assets: AssetType[] = result.data;

        const usedData = assets.filter(
          (asset: AssetType) =>
            asset.client_archetype_ids &&
            asset.client_archetype_ids.some((id) => id !== null)
        );
        const unusedData = assets.filter(
          (asset: AssetType) =>
            !asset.client_archetype_ids ||
            asset.client_archetype_ids.every((id) => id === null)
        );
        // setSessionAssets(usedData);

        // const unusedData = assets.filter(
        //   (asset: AssetType) =>
        //     !asset.client_archetype_ids ||
        //     asset.client_archetype_ids.every((id) => id === null)
        // );
        setOtherAssets(assets);
        const isSelix = window.location.toString().includes("selix");

        if (isSelix) {
          console.log(isSelix);
          const dataOrderedByMostRecent = assets.sort((a, b) => {
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
          });

          const sessionData = dataOrderedByMostRecent.filter((item) => {
            return item.selix_sessions_in_use.includes(
              sessionId ? +sessionId : -1
            );
          });

          const baselineData = dataOrderedByMostRecent.filter((item) => {
            return item.is_baseline_asset;
          });

          const otherData = dataOrderedByMostRecent.filter((item) => {
            return (
              !item.is_baseline_asset &&
              !item.selix_sessions_in_use.includes(sessionId ? +sessionId : -1)
            );
          });

          // const usedData = dataOrderedByMostRecent.filter(
          //   (asset: AssetType) =>
          //     asset.client_archetype_ids &&
          //     asset.client_archetype_ids.some((id) => id !== null)
          // );
          // const unusedData = dataOrderedByMostRecent.filter(
          //   (asset: AssetType) =>
          //     !asset.client_archetype_ids ||
          //     asset.client_archetype_ids.every((id) => id === null)
          // );
          setSessionAssets(sessionData);
          setBaselineAssets(baselineData);
          setOtherAssets(otherData);
        }
      } else {
        showNotification({
          title: "Error",
          message: "Failed to fetch assets",
          color: "red",
        });
      }
    } catch (error) {
      console.error(error);
      showNotification({
        title: "Error",
        message: "An error occurred while fetching assets",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const { data: assets, refetch: refetchAssets } = useQuery({
    queryKey: [`get-assets`],
    queryFn: fetchAllAssets,
  });

  return (
    <Flex direction={"column"} px={"5%"} gap={"sm"} bg={"white"}>
      <LoadingOverlay visible={loading} zIndex={3}/>
      <Flex mt="md" align={"center"} justify={"space-between"}>
        <Flex align={"center"} gap={"4px"}>
          <Text size={"25px"} fw={700}>
            {isSelix ? "" : "SellScale's Asset Library"}
          </Text>
          {isSelix && session && (
            <Switch
              checked={session.is_ingestion_session}
              onChange={async () => await toggleIngestionMode()}
              label={
                session.is_ingestion_session ? "Ingestion On" : "Ingestion Off"
              }
            />
          )}
        </Flex>
        <Flex gap={"sm"}>
          {/* <Flex> */}
          {/*   <Button */}
          {/*     color={viewType === "list" ? "blue" : "gray"} */}
          {/*     variant={viewType === "list" ? "light" : "outline"} */}
          {/*     leftIcon={<IconList size={"1rem"} />} */}
          {/*     onClick={() => setViewType("list")} */}
          {/*     style={{ */}
          {/*       borderTopRightRadius: "0px", */}
          {/*       borderBottomRightRadius: "0px", */}
          {/*       border: "1px solid", */}
          {/*     }} */}
          {/*   > */}
          {/*     List View */}
          {/*   </Button> */}
          {/*   <Button */}
          {/*     color={viewType === "card" ? "blue" : "gray"} */}
          {/*     variant={viewType === "card" ? "light" : "outline"} */}
          {/*     leftIcon={<IconLayoutBoard size={"1rem"} />} */}
          {/*     onClick={() => setViewType("card")} */}
          {/*     style={{ */}
          {/*       borderTopLeftRadius: "0px", */}
          {/*       borderBottomLeftRadius: "0px", */}
          {/*       border: "1px solid", */}
          {/*     }} */}
          {/*   > */}
          {/*     Card View */}
          {/*   </Button> */}
          {/* </Flex> */}
          <Button leftIcon={<IconPlus size={"1rem"} />} onClick={open}>
            Add New Asset
          </Button>
        </Flex>
      </Flex>
      <Box>
        {!isSelix && (
          <Flex justify={"space-between"} align={"center"}>
            <Flex
              align={"center"}
              w={"fit-content"}
              bg={"#f3f4f6"}
              p={4}
              style={{
                borderRadius: "8px",
                borderBottomRightRadius: "0px",
                borderBottomLeftRadius: "0px",
              }}
            >
              <Button
                onClick={() => {
                  setTabs("non_generative");
                  setSemiTabs("all");
                }}
                color={"gray"}
                variant={tabs === "non_generative" ? "tranparent" : "white"}
              >
                Non Generative
              </Button>
              <Button
                onClick={() => {
                  setTabs("generative");
                  setSemiTabs("offers");
                }}
                color={"gray"}
                variant={tabs === "generative" ? "tranparent" : "white"}
              >
                Generative
              </Button>
            </Flex>
            <Switch defaultChecked label="Show Used Assets Only" mr={"xs"} />
          </Flex>
        )}
        {tabs === "non_generative" && !isSelix ? (
          <Flex
            align={"center"}
            justify={"space-between"}
            w={"100%"}
            bg={"#f3f4f6"}
            p={8}
            style={{ borderRadius: "8px", borderTopLeftRadius: "0px" }}
          >
            <Flex>
              <Button
                onClick={() => setSemiTabs("all")}
                color={"gray"}
                variant={semiTabs === "all" ? "white" : "tranparent"}
              >
                All
              </Button>
              <Button
                onClick={() => setSemiTabs("cta")}
                color={"gray"}
                variant={semiTabs === "cta" ? "white" : "tranparent"}
              >
                CTAs
              </Button>
              <Button
                onClick={() => setSemiTabs("email_templates")}
                color={"gray"}
                variant={
                  semiTabs === "email_templates" ? "white" : "tranparent"
                }
              >
                Email Templates
              </Button>
              <Button
                onClick={() => setSemiTabs("linkedin_templates")}
                color={"gray"}
                variant={
                  semiTabs === "linkedin_templates" ? "white" : "tranparent"
                }
              >
                Linkedin Templates
              </Button>
            </Flex>
          </Flex>
        ) : !isSelix ? (
          <Flex
            align={"center"}
            justify={"space-between"}
            w={"100%"}
            bg={"#f3f4f6"}
            p={8}
            style={{ borderRadius: "8px", borderTopLeftRadius: "0px" }}
          >
            <Flex>
              <Button
                onClick={() => setSemiTabs("offers")}
                color={"gray"}
                variant={semiTabs === "offers" ? "white" : "tranparent"}
              >
                Offers
              </Button>
              <Button
                onClick={() => setSemiTabs("phrases")}
                color={"gray"}
                variant={semiTabs === "phrases" ? "white" : "tranparent"}
              >
                Phrases
              </Button>
              <Button
                onClick={() => setSemiTabs("study")}
                color={"gray"}
                variant={semiTabs === "study" ? "white" : "tranparent"}
              >
                Case Studies
              </Button>
              <Button
                onClick={() => setSemiTabs("research")}
                color={"gray"}
                variant={semiTabs === "research" ? "white" : "tranparent"}
              >
                Research Points
              </Button>
              <Button
                onClick={() => setSemiTabs("email_subject_lines")}
                color={"gray"}
                variant={
                  semiTabs === "email_subject_lines" ? "white" : "tranparent"
                }
              >
                Email Subject Lines
              </Button>
              <Button
                onClick={() => setSemiTabs("linkedin_cta")}
                color={"gray"}
                variant={semiTabs === "linkedin_cta" ? "white" : "tranparent"}
              >
                Linkedin CTAs
              </Button>
            </Flex>
          </Flex>
        ) : (
          <></>
        )}
        {/* {tabs === 'non_generative' ? <NonGenerative view={viewType} data={data} /> : <Generative view={viewType} data={data} />} */}
        {viewType === "card" ? (
          <CardView
            fetchAssets={fetchAllAssets}
            type={tabs}
            view={viewType}
            semiTabs={semiTabs}
            sessionAssets={filteredSessionAssets}
            baselineAssets={filteredBaselineAssets}
            otherAssets={filteredOtherAssets}
          />
        ) : (
          <ListView
            fetchAssets={fetchAllAssets}
            type={tabs}
            view={viewType}
            semiTabs={semiTabs}
            ragAssets={filteredSessionAssets}
            otherAssets={filteredOtherAssets}
          />
        )}
      </Box>
      <Modal
        opened={opened}
        onClose={() => {
          close();
          setAssetType(null);
          setIngestionType("");
        }}
        size="640px"
        title={
          <Text fw={600} size={"lg"}>
            SellScale Asset Ingestor
          </Text>
        }
      >
        <Flex direction={"column"} gap={"md"}>
          <TextInput
            label="Name of Asset"
            placeholder="Enter name"
            required
            onChange={(e) => setAssetName(e.target.value)}
          />
          <Flex direction={"column"}>
            <Text size={"14px"} fw={400} mb={"3px"}>
              Asset Type
            </Text>
            <Radio.Group
              onChange={(e) => setAssetType(e as any)}
              style={{ border: "1px solid #ced4da", borderRadius: "8px" }}
              p={"sm"}
              pt={"-sm"}
            >
              <Group mt="xs">
                <Radio value="CTA" label="CTAs" size="sm" />
                <Radio value="Linkedin Initial Template" label={"Li Initial Template"} size="sm"/>
                
                <Radio value="Email Initial Template" label="Email Initial Template" size="sm" />
                <Radio value="Linkedin Bump Framework" label="Li Bump Framework" size="sm" />
                <Radio value="Email Followup" label="Email Followup" size="sm" />
                <Radio value="Copy / research" label="Copy / research" size="sm" />
                <Radio value="Value Props" label="Value Props" size="sm" />
                <Radio value="Phrases" label="Phrases" size="sm" />
                <Radio value="Social Proof" label="Social Proof" size="sm" />
              </Group>
            </Radio.Group>
          </Flex>
          <Flex direction={"column"}>
            <Text size={"14px"} fw={400} mb={"3px"}>
              Ingestion Method
            </Text>
            <Radio.Group
              onChange={(e) =>
                setIngestionType(e as "PDF" | "URL" | "TEXT" | "")
              }
              style={{ border: "1px solid #ced4da", borderRadius: "8px" }}
              p={"sm"}
              pt={"-sm"}
            >
              <Group mt="xs">
                <Radio value="TEXT" label="Text Dump" size="sm" />
                <Radio value="URL" label="URL" size="sm" />
                <Radio value="PDF" label="PDF" size="sm" />
                <Radio value="IMAGE" label="Image" size="sm" />
                {/* <Radio value='URL' label='URL' size='sm' /> */}
                {/* <Radio value='TEXT' label='Write Manually' size='sm' /> */}
              </Group>
            </Radio.Group>
          </Flex>
          {assetType !== null &&
          (ingestionType === "PDF" || ingestionType === "IMAGE") ? (
            <Flex
              style={{
                border: "1px solid #e2edfc",
                borderRadius: "8px",
                borderStyle: "dashed",
              }}
              bg={"#f5f9fe"}
              justify={"center"}
              p={40}
              align={"center"}
              gap={"lg"}
            >
              {!file ? (
                <Dropzone
                  loading={false}
                  multiple={false}
                  maxSize={MAX_FILE_SIZE_MB * 1024 ** 2}
                  onDrop={async (files: any) => {
                    setFile(files[0]);
                    setPreview(true);
                  }}
                  onReject={(files: any) => {
                    const error = files[0].errors[0];
                    showNotification({
                      id: "file-upload-error",
                      title: `Error uploading file`,
                      message: error.message,
                      color: "red",
                      autoClose: 5000,
                    });
                  }}
                  accept={[MIME_TYPES.pdf, MIME_TYPES.png, MIME_TYPES.jpeg]}
                  bg={"#f5f9ff"}
                  style={{ border: "2px solid #afcdf9", borderStyle: "dashed" }}
                >
                  <Flex
                    align={"center"}
                    justify={"center"}
                    gap={80}
                    py={20}
                    style={{ minHeight: 200, pointerEvents: "none" }}
                  >
                    <Group>
                      <Dropzone.Accept>
                        <IconUpload
                          size={80}
                          stroke={1.5}
                          color={
                            theme.colors[theme.primaryColor][
                              theme.colorScheme === "dark" ? 4 : 6
                            ]
                          }
                        />
                      </Dropzone.Accept>
                      <Dropzone.Reject>
                        <IconX
                          size={80}
                          stroke={1.5}
                          color={
                            theme.colors.red[
                              theme.colorScheme === "dark" ? 4 : 6
                            ]
                          }
                        />
                      </Dropzone.Reject>
                      <Dropzone.Idle>
                        <IconCloudUpload
                          color="#2476eb"
                          size={100}
                          stroke={0.5}
                        />
                      </Dropzone.Idle>

                      <div>
                        <Text align="center" size="xl" inline fw={500}>
                          Drag & drop files or{" "}
                          <span
                            style={{
                              color: "#2476eb",
                              textDecoration: "underline",
                            }}
                          >
                            Browse
                          </span>
                        </Text>
                        <Text size="sm" color="dimmed" inline mt={12}>
                          Acceptable formats: JPG, PNG, PDF
                        </Text>
                      </div>
                    </Group>
                  </Flex>
                </Dropzone>
              ) : (
                <Flex
                  gap={"xs"}
                  align={"center"}
                  justify={"space-between"}
                  px={"md"}
                >
                  <Flex>
                    <IconFileSpreadsheet color="teal" />
                    <Text size={"lg"} style={{ color: "teal" }}>
                      {file?.name}
                    </Text>
                  </Flex>
                  <IconX
                    color="red"
                    size={"1.2rem"}
                    className="hover:cursor-pointer"
                    onClick={() => {
                      // setFileJSON(null);
                      setFile(null);
                    }}
                  />
                </Flex>
              )}
            </Flex>
          ) : (assetType !== null && ingestionType === "TEXT") ||
            ingestionType === "URL" ? (
            <Flex direction={"column"}>
              <Textarea
                minRows={3}
                label={ingestionType}
                placeholder="Paste text here."
                value={assetValue}
                onChange={(event) => {
                  setAssetValue(event.target.value);
                }}
              />
            </Flex>
          ) : (
            <></>
          )}
          <Flex justify={"space-between"} gap={"xl"} mt={"sm"}>
            <Button
              variant="outline"
              color="gray"
              w={"100%"}
              onClick={() => {
                close();
                setAssetType(null);
                setIngestionType("");
              }}
            >
              Go Back
            </Button>
            <Button
              w={"100%"}
              disabled={assetType && ingestionType && assetName ? false : true}
              onClick={async () => {
                const fileAsB64Raw = file
                  ? btoa(unescape(encodeURIComponent(await file.text())))
                  : null;

                fetch(`${API_URL}/client/create_archetype_asset`, {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${userToken}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    selix_session_id: isSelix
                      ? new URLSearchParams(window.location.search).get(
                          "session_id"
                        )
                      : undefined,
                    asset_key: assetName,
                    asset_raw_value:
                      ingestionType === "TEXT" || ingestionType === "URL"
                        ? assetValue
                        : file
                        ? fileAsB64Raw
                        : null,
                    asset_tag: assetType,
                    asset_type: ingestionType,
                    asset_value:
                      ingestionType === "TEXT" || ingestionType === "URL"
                        ? assetValue
                        : file
                        ? fileAsB64Raw
                        : null,
                    client_archetype_ids: [],
                    client_id: userData.client.id,
                  }),
                })
                  .then((response) => response.json())
                  .then((result) => {
                    if (result.message === "Success") {
                      showNotification({
                        title: "Success",
                        message: "Asset added successfully",
                        color: "green",
                      });
                      fetchAllAssets();
                      close();
                      setAssetType(null);
                      setIngestionType("");
                    } else {
                      showNotification({
                        title: "Error",
                        message: "Failed to add asset",
                        color: "red",
                      });
                    }
                  })
                  .catch((error) => {
                    showNotification({
                      title: "Error",
                      message: "An error occurred while adding asset",
                      color: "red",
                    });
                  });
              }}
            >
              Summarize & Add Asset
            </Button>
          </Flex>
        </Flex>
      </Modal>
      <Modal
        opened={openedAsset}
        onClose={() => {
          closeAsset();
          setEditSummary(false);
        }}
        size="640px"
        title={
          <Text fw={600} size={"lg"}>
            SellScale Asset Ingestor
          </Text>
        }
      >
        <Flex
          direction={"column"}
          style={{ border: "1px solid #ced4da", borderRadius: "8px" }}
          p={"lg"}
          gap={"sm"}
        >
          <Badge color="pink" w={"fit-content"}>
            case study
          </Badge>
          <Text fw={600} lineClamp={1} size={"xl"}>
            Behavioral Health ROI
          </Text>
          <Group mt={"-sm"}>
            <Text
              style={{ display: "flex", gap: "8px", alignItems: "center" }}
              fw={600}
              color="gray"
            >
              Open Rate:{" "}
              <Text fw={800} color={"green"}>
                76%
              </Text>
            </Text>
            <Divider orientation="vertical" />
            <Text
              style={{ display: "flex", gap: "8px", alignItems: "center" }}
              fw={600}
              color="gray"
            >
              Reply Rate:{" "}
              <Text fw={800} color={"green"}>
                68%
              </Text>
            </Text>
          </Group>
          <Flex
            p={"md"}
            direction={"column"}
            gap={"xs"}
            bg={"#fff5ff"}
            style={{ borderRadius: "8px" }}
          >
            <Flex align={"center"} justify={"space-between"}>
              <Text
                color="#ec58fb"
                size={"lg"}
                fw={700}
                style={{ display: "flex", alignItems: "center", gap: "3px" }}
              >
                <IconSparkles size={"1.4rem"} fill="pink" /> AI Summary
              </Text>
              {editSummary ? (
                <Button
                  size="xs"
                  radius={"xl"}
                  onClick={() => {
                    setEditSummary(false);
                  }}
                >
                  save Summary
                </Button>
              ) : (
                <Button
                  leftIcon={<IconEdit size={"0.8rem"} />}
                  color="pink"
                  size="xs"
                  radius={"xl"}
                  variant="outline"
                  onClick={() => setEditSummary(true)}
                >
                  Edit Summary
                </Button>
              )}
            </Flex>
            <Flex align={"end"}>
              {editSummary ? (
                <Textarea
                  w={"100%"}
                  defaultValue={
                    "This case study explores how lorem Ipsum dolor sit amet, consectetur adipiscing elit testsdsdasdfasdasdfasdfasdfasdf"
                  }
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                />
              ) : (
                <Text lineClamp={2} size={"sm"} color="gray" fw={600}>
                  {summary}
                </Text>
              )}
            </Flex>
          </Flex>
          <Flex justify={"space-between"} gap={"xl"} mt={"sm"}>
            <Button
              variant="outline"
              color="gray"
              w={"100%"}
              onClick={() => {
                closeAsset();
              }}
            >
              Go Back
            </Button>
            <Button w={"100%"}>Add Asset</Button>
          </Flex>
        </Flex>
      </Modal>
      {/* <Flex */}
      {/*   sx={{ */}
      {/*     border: "1px solid #cfcfcf", */}
      {/*     borderStyle: "dashed", */}
      {/*     borderRadius: "8px", */}
      {/*   }} */}
      {/*   bg={"#f3f4f6"} */}
      {/*   p={"lg"} */}
      {/*   mt={"lg"} */}
      {/*   mb={140} */}
      {/* > */}
      {/*   <List spacing="1px" size="sm" center> */}
      {/*     <List.Item icon={<IconBulb size={"1.2rem"} color="#228be6" />}> */}
      {/*       <Text fw={600} size={13}> */}
      {/*         These are the assets that have been imported into the system for */}
      {/*         SellScale. */}
      {/*       </Text> */}
      {/*     </List.Item> */}
      {/*     <List.Item icon={<IconArrowRight size={"1.2rem"} color="#228be6" />}> */}
      {/*       <Text */}
      {/*         size={"xs"} */}
      {/*         color="gray" */}
      {/*         fw={500} */}
      {/*         style={{ display: "flex", gap: "4px", alignItems: "center" }} */}
      {/*       > */}
      {/*         Click on <span style={{ color: "#228be6" }}>Add New Asset</span>{" "} */}
      {/*         to add a new asset to the library */}
      {/*       </Text> */}
      {/*     </List.Item> */}
      {/*     <List.Item icon={<IconArrowRight size={"1.2rem"} color="#228be6" />}> */}
      {/*       <Text */}
      {/*         size={"xs"} */}
      {/*         color="gray" */}
      {/*         fw={500} */}
      {/*         style={{ display: "flex", gap: "4px", alignContent: "center" }} */}
      {/*       > */}
      {/*         To use assets in this campaign, click on the{" "} */}
      {/*         <span style={{ color: "#228be6   " }}>Toggle</span>{" "} */}
      {/*         <IconToggleRight */}
      {/*           color="#228be6" */}
      {/*           size={"1.1rem"} */}
      {/*           style={{ marginTop: "1px" }} */}
      {/*         />{" "} */}
      {/*         button */}
      {/*       </Text> */}
      {/*     </List.Item> */}
      {/*     <List.Item icon={<IconArrowRight size={"1.2rem"} color="#228be6" />}> */}
      {/*       <Text */}
      {/*         size={"xs"} */}
      {/*         color="gray" */}
      {/*         fw={500} */}
      {/*         style={{ display: "flex", gap: "4px", alignContent: "center" }} */}
      {/*       > */}
      {/*         To remove an asset from the library, click on the{" "} */}
      {/*         <span style={{ color: "red" }}>Delete</span> */}
      {/*         <IconTrash */}
      {/*           color="red" */}
      {/*           size={"0.9rem"} */}
      {/*           style={{ marginTop: "1px" }} */}
      {/*         />{" "} */}
      {/*         button */}
      {/*       </Text> */}
      {/*     </List.Item> */}
      {/*   </List> */}
      {/* </Flex> */}
    </Flex>
  );
}
