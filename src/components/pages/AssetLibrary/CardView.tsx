import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Collapse,
  Divider,
  Flex,
  Grid,
  Group,
  HoverCard,
  List,
  Modal,
  MultiSelect,
  ScrollArea,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from "@mantine/core";
import {
  IconChevronDown,
  IconChevronRight,
  IconChevronUp,
  IconCircleCheck,
  IconCircleX,
  IconEdit,
  IconExternalLink,
  IconInfoCircle,
  IconLink,
  IconTrash,
} from "@tabler/icons";
import { useDisclosure } from "@mantine/hooks";
import { IconFileTypePdf, IconPdf, IconSparkles } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { AssetType } from "./AssetLibraryV2";
import { useRecoilValue } from "recoil";
import { API_URL } from "@constants/data";
import { userTokenState } from "@atoms/userAtoms";
import { showNotification } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";

function LineClampText({ content }: { content: string }) {
  const [clamp, setClamp] = useState<number | undefined>(6);

  return (
    <Text
      lineClamp={clamp}
      size="xs"
      color="gray"
      fw={600}
      onClick={(e) => {
        e.stopPropagation();
        setClamp((prev) => (prev === 6 ? undefined : 6));
      }}
    >
      {content}
    </Text>
  );
}

export default function CardView(props: any) {
  const sessionAssets = props.sessionAssets as AssetType[];
  const baselineAssets = props.baselineAssets as AssetType[];
  const otherAssets = props.otherAssets as AssetType[];

  const [openedSession, { toggle: sessionToggle }] = useDisclosure(true);
  const [openedBaseline, { toggle: baselineToggle }] = useDisclosure(false);
  const [openedOther, { toggle: otherToggle }] = useDisclosure(false);

  const [stepModalOpened, { open: stepOpen, close: stepClose }] =
    useDisclosure(false);
  const [useModalOpened, { open: useOpen, close: useClose }] =
    useDisclosure(false);
  const [assetModalOpened, { open: assetOpen, close: assetClose }] =
    useDisclosure(false);
  const [editAsset, setEditAsset] = useState<AssetType>();
  const [reason, setReason] = useState("");
  const userToken = useRecoilValue(userTokenState);

  const [stepData, setStepData] = useState("Use in Any Step");

  const isSelix = window.location.href.includes("selix");

  const queryClient = useQueryClient();

  const [textFilterOther, setTextFilterOther] = useState<string>("");

  const moveToOtherAssets = async function (assetId: number) {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session_id");

    const response = await fetch(`${API_URL}/client/move_to_other_assets`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        asset_id: assetId,
        session_id: sessionId,
      }),
    });

    if (response.ok) {
      queryClient.invalidateQueries(["get-assets"]);
      showNotification({
        title: "Success!",
        message: "Successfully Moved Asset to other Assets",
        color: "green",
      });
    } else {
      showNotification({
        title: "Failed!",
        message: "Failed to Move asset to other assets",
        color: "red",
      });
    }
  };

  const moveToBaselineAssets = async function (assetId: number) {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session_id");

    const response = await fetch(`${API_URL}/client/move_to_baseline_assets`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        asset_id: assetId,
        session_id: sessionId,
      }),
    });

    if (response.ok) {
      queryClient.invalidateQueries(["get-assets"]);
      showNotification({
        title: "Success!",
        message: "Successfully Moved Asset to baseline Assets",
        color: "green",
      });
    } else {
      showNotification({
        title: "Failed!",
        message: "Failed to Move asset to baseline assets",
        color: "red",
      });
    }
  };

  const moveToSessionAssets = async function (assetId: number) {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session_id");

    const response = await fetch(`${API_URL}/client/move_to_session_assets`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        asset_id: assetId,
        session_id: sessionId,
      }),
    });

    if (response.ok) {
      queryClient.invalidateQueries(["get-assets"]);
      showNotification({
        title: "Success!",
        message: "Successfully Moved Asset to Session Assets",
        color: "green",
      });
    } else {
      showNotification({
        title: "Failed!",
        message: "Failed to Move asset to session assets",
        color: "red",
      });
    }
  };

  const deleteAssets = async function (assetId: number) {
    const response = await fetch(`${API_URL}/client/asset`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        asset_id: assetId,
      }),
    });

    if (response.ok) {
      queryClient.invalidateQueries(["get-assets"]);
      showNotification({
        title: "Success!",
        message: "Successfully deleted asset",
        color: "green",
      });
    } else {
      showNotification({
        title: "Failed!",
        message: "Failed to delete asset",
        color: "red",
      });
    }
  };

  return (
    <>
      <Modal
        opened={!!editAsset}
        onClose={() => setEditAsset(undefined)}
        title="Edit Asset"
      >
        {editAsset && (
          <Stack spacing="md">
            <TextInput
              label="Asset Key"
              value={editAsset.asset_key}
              onChange={(e) =>
                setEditAsset({ ...editAsset, asset_key: e.target.value })
              }
            />
            <Textarea
              label="Asset Raw Value"
              value={editAsset.asset_raw_value || ""}
              onChange={(e) =>
                setEditAsset({
                  ...editAsset,
                  asset_raw_value: e.target.value,
                  asset_value: e.target.value,
                })
              }
              minRows={8}
            />
            <Select
              label="Asset Type"
              value={editAsset.asset_type}
              onChange={(value) =>
                setEditAsset({
                  ...editAsset,
                  asset_type: value as "PDF" | "URL" | "TEXT",
                })
              }
              data={[
                { value: "PDF", label: "PDF" },
                { value: "URL", label: "URL" },
                { value: "TEXT", label: "TEXT" },
              ]}
            />
            <TextInput
              disabled
              label="Asset Value"
              value={editAsset.asset_value}
              onChange={(e) =>
                setEditAsset({ ...editAsset, asset_value: e.target.value })
              }
            />
            <MultiSelect
              label="Client Archetypes"
              data={
                editAsset.client_archetype_ids
                  ? editAsset.client_archetype_ids.map((id) => ({
                      value: id.toString(),
                      label: id.toString(),
                    }))
                  : []
              }
              value={editAsset.client_archetype_ids?.map((id) => id.toString())}
              onChange={(values) =>
                setEditAsset({
                  ...editAsset,
                  client_archetype_ids: values.map(Number),
                })
              }
              placeholder="Select archetype IDs"
              creatable
              searchable
              getCreateLabel={(query) => `+ Create ${query}`}
              onCreate={(query) => {
                const newId = Number(query);
                if (!isNaN(newId)) {
                  setEditAsset((prev: any) => ({
                    ...prev,
                    client_archetype_ids: [...prev.client_archetype_ids, newId],
                  }));
                  return { value: query, label: query };
                }
                return null;
              }}
            />
            {/* <TextInput
            label="Client ID"
            value={editAsset.client_id.toString()}
            onChange={(e) => setEditAsset({ ...editAsset, client_id: Number(e.target.value) })}
          /> */}
            <Select
              label="Asset Tags"
              data={[
                { value: "CTA", label: "CTAs" },
                {
                  value: "Linkedin Initial Template",
                  label: "Li Initial Template",
                },
                {
                  value: "Email Initial Template",
                  label: "Email Initial Template",
                },
                {
                  value: "Linkedin Bump Framework",
                  label: "Li Bump Framework",
                },
                { value: "Email Followup", label: "Email Followup" },
                { value: "Copy / research", label: "Copy / research" },
                { value: "Value Props", label: "Value Props" },
                { value: "Phrases", label: "Phrases" },
                { value: "Social Proof", label: "Social Proof" },
              ]}
              value={editAsset.asset_tag}
              onChange={(value) =>
                setEditAsset({ ...editAsset, asset_tag: value ?? "" })
              }
              placeholder="Select Tags"
              searchable
            />
            <TextInput
              disabled
              label="Number of Opens"
              value={editAsset.num_opens ? editAsset.num_opens.toString() : "0"}
              onChange={(e) =>
                setEditAsset({
                  ...editAsset,
                  num_opens: Number(e.target.value),
                })
              }
            />
            <TextInput
              disabled
              label="Number of Replies"
              value={
                editAsset.num_replies ? editAsset.num_replies.toString() : "0"
              }
              onChange={(e) =>
                setEditAsset({
                  ...editAsset,
                  num_replies: Number(e.target.value),
                })
              }
            />
            <TextInput
              disabled
              label="Number of Sends"
              value={editAsset.num_sends ? editAsset.num_sends.toString() : "0"}
              onChange={(e) =>
                setEditAsset({
                  ...editAsset,
                  num_sends: Number(e.target.value),
                })
              }
            />
            <Button
              onClick={() => {
                fetch(`${API_URL}/client/update_asset`, {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${userToken}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    ...editAsset,
                    asset_id: editAsset.id,
                  }),
                }).then(() => {
                  props.fetchAssets();
                  setEditAsset(undefined);
                });
              }}
            >
              Save Changes
            </Button>
          </Stack>
        )}
      </Modal>
      <Stack mt={"lg"}>
        <Flex gap={"sm"} align={"center"} w={"100%"}>
          <Text sx={{ whiteSpace: "nowrap" }} color="gray" fw={500}>
            Session Assets
          </Text>
          <Divider w={"100%"} />
          <ActionIcon onClick={sessionToggle}>
            {openedSession ? <IconChevronUp /> : <IconChevronDown />}
          </ActionIcon>
        </Flex>
        <Collapse in={openedSession && sessionAssets.length > 0}>
          <ScrollArea h={700}>
            <Grid>
              {sessionAssets?.map((item: AssetType, index: number) => {
                return (
                  <Grid.Col
                    span={window.location.href.includes("selix") ? 6 : 4}
                    key={index}
                  >
                    <Flex
                      style={{
                        border: "1px solid #ced4da",
                        borderRadius: "8px",
                      }}
                      p={"sm"}
                      direction={"column"}
                      gap={"sm"}
                    >
                      <Flex align={"center"} justify={"space-between"}>
                        {item.asset_type === "PDF" && (
                          <Button
                            radius={"xl"}
                            size="xs"
                            variant="light"
                            rightIcon={<IconChevronRight size={"1rem"} />}
                            onClick={assetOpen}
                          >
                            View PDF
                          </Button>
                        )}
                      </Flex>
                      <Flex gap={"5px"}>
                        <Badge
                          size="sm"
                          color={
                            item.asset_type === "PDF"
                              ? "pink"
                              : item?.asset_type === "URL"
                              ? "orange"
                              : "green"
                          }
                        >
                          {item?.asset_tag}
                        </Badge>
                        {/* <Badge variant="outline" color="gray" size="lg"> */}
                        {/*   type: {item?.asset_type} */}
                        {/* </Badge> */}
                      </Flex>
                      <Flex align={"center"} w={"fit-content"}>
                        <Text fw={700} lineClamp={1} w={"100%"} size={"md"}>
                          {item?.asset_key}
                        </Text>
                      </Flex>
                      <Flex
                        p={"md"}
                        direction={"column"}
                        gap={"xs"}
                        bg={item?.asset_raw_value ? "#fff5ff" : "#f4f9ff"}
                        style={{ borderRadius: "8px" }}
                      >
                        {/* {!item?.asset_raw_value && (
                        <Flex align={'center'} justify={'space-between'}>
                          <Text
                            color='#ec58fb'
                            size={'lg'}
                            fw={700}
                            style={{ display: 'flex', alignItems: 'center', gap: '3px' }}
                          >
                            <IconSparkles size={'1.4rem'} fill='pink' /> AI Summary
                          </Text>
                          <IconEdit color='gray' size={'1.2rem'} />
                        </Flex>
                      )} */}
                        <Flex align={"end"}>
                          <LineClampText
                            content={item?.asset_raw_value || item?.asset_value}
                          />
                          {true && (
                            <Flex onClick={() => setEditAsset(item)}>
                              <IconEdit color="gray" size={"1.2rem"} />
                            </Flex>
                          )}
                        </Flex>
                      </Flex>
                      <Group>
                        <Text
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                          }}
                          fw={500}
                          color="gray"
                          size={"sm"}
                        >
                          # Sends:{" "}
                          <Text
                            fw={500}
                            color={item?.num_sends > 50 ? "green" : "orange"}
                          >
                            {item?.num_sends}
                          </Text>
                        </Text>
                        <Divider orientation="vertical" />
                        <ActionIcon
                          onClick={async () => {
                            await moveToBaselineAssets(item.id);
                          }}
                        >
                          <IconChevronDown size={"sm"} />
                        </ActionIcon>
                        <ActionIcon
                          onClick={async () => {
                            await deleteAssets(item.id);
                          }}
                        >
                          <IconTrash size={"sm"} color={"red"} />
                        </ActionIcon>
                      </Group>

                      <Flex gap={"xl"}>
                        {/* <Button */}
                        {/*   w={"100%"} */}
                        {/*   size="md" */}
                        {/*   variant="outline" */}
                        {/*   onClick={() => { */}
                        {/*     setStepStatus(false); */}
                        {/*     stepOpen(); */}
                        {/*     //   setStepKey(index); */}
                        {/*   }} */}
                        {/* > */}
                        {/*   {index === stepKey ? stepValue : "Use in Any Step"} */}
                        {/* </Button> */}
                        {/* <Button */}
                        {/*   w={"100%"} */}
                        {/*   size="md" */}
                        {/*   color="gray" */}
                        {/*   variant="outline" */}
                        {/*   leftIcon={<IconCircleX size={"1.2rem"} />} */}
                        {/*   onClick={() => { */}
                        {/*     fetch(`${API_URL}/client/update_asset`, { */}
                        {/*       method: "POST", */}
                        {/*       headers: { */}
                        {/*         Authorization: `Bearer ${userToken}`, */}
                        {/*         "Content-Type": "application/json", */}
                        {/*       }, */}
                        {/*       body: JSON.stringify({ */}
                        {/*         ...item, */}
                        {/*         client_archetype_ids: [], */}
                        {/*         asset_id: item.id, */}
                        {/*       }), */}
                        {/*     }).then(() => { */}
                        {/*       props.fetchAssets(); */}
                        {/*       showNotification({ */}
                        {/*         title: "Asset removed from campaigns", */}
                        {/*         message: "Asset removed from campaigns", */}
                        {/*       }); */}
                        {/*     }); */}
                        {/*   }} */}
                        {/* > */}
                        {/*   Stop Using */}
                        {/* </Button> */}
                      </Flex>
                    </Flex>
                  </Grid.Col>
                );
              })}
            </Grid>
          </ScrollArea>
        </Collapse>
        <Flex gap={"sm"} align={"center"} w={"100%"}>
          <Text sx={{ whiteSpace: "nowrap" }} color="gray" fw={500}>
            Baseline Assets
          </Text>
          <Divider w={"100%"} />
          <ActionIcon onClick={baselineToggle}>
            {openedBaseline ? <IconChevronUp /> : <IconChevronDown />}
          </ActionIcon>
        </Flex>
        <Collapse in={openedBaseline && baselineAssets.length > 0}>
          <ScrollArea h={700}>
            <Grid>
              {baselineAssets?.map((item: AssetType, index: number) => {
                return (
                  <Grid.Col
                    span={window.location.href.includes("selix") ? 6 : 4}
                    key={index}
                  >
                    <Flex
                      style={{
                        border: "1px solid #ced4da",
                        borderRadius: "8px",
                      }}
                      p={"sm"}
                      direction={"column"}
                      gap={"sm"}
                    >
                      <Flex align={"center"} justify={"space-between"}>
                        {item.asset_type === "PDF" && (
                          <Button
                            radius={"xl"}
                            size="xs"
                            variant="light"
                            rightIcon={<IconChevronRight size={"1rem"} />}
                            onClick={assetOpen}
                          >
                            View PDF
                          </Button>
                        )}
                      </Flex>
                      <Flex gap={"5px"}>
                        <Badge
                          size="sm"
                          color={
                            item.asset_type === "PDF"
                              ? "pink"
                              : item?.asset_type === "URL"
                              ? "orange"
                              : "green"
                          }
                        >
                          {item?.asset_tag}
                        </Badge>
                        {/* <Badge variant="outline" color="gray" size="lg"> */}
                        {/*   type: {item?.asset_type} */}
                        {/* </Badge> */}
                      </Flex>
                      <Flex align={"center"} w={"fit-content"}>
                        <Text fw={700} lineClamp={1} w={"100%"} size={"md"}>
                          {item?.asset_key}
                        </Text>
                      </Flex>
                      <Flex
                        p={"md"}
                        direction={"column"}
                        gap={"xs"}
                        bg={item?.asset_raw_value ? "#fff5ff" : "#f4f9ff"}
                        style={{ borderRadius: "8px" }}
                      >
                        {/* {!item?.asset_raw_value && (
                        <Flex align={'center'} justify={'space-between'}>
                          <Text
                            color='#ec58fb'
                            size={'lg'}
                            fw={700}
                            style={{ display: 'flex', alignItems: 'center', gap: '3px' }}
                          >
                            <IconSparkles size={'1.4rem'} fill='pink' /> AI Summary
                          </Text>
                          <IconEdit color='gray' size={'1.2rem'} />
                        </Flex>
                      )} */}
                        <Flex align={"end"}>
                          <LineClampText
                            content={item?.asset_raw_value || item?.asset_value}
                          />
                          {true && (
                            <Flex onClick={() => setEditAsset(item)}>
                              <IconEdit color="gray" size={"1.2rem"} />
                            </Flex>
                          )}
                        </Flex>
                      </Flex>
                      <Group>
                        <Text
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                          }}
                          fw={500}
                          color="gray"
                          size={"sm"}
                        >
                          # Sends:{" "}
                          <Text
                            fw={500}
                            color={item?.num_sends > 50 ? "green" : "orange"}
                          >
                            {item?.num_sends}
                          </Text>
                        </Text>
                        <Divider orientation="vertical" />

                        <Tooltip label={"Move to Session Assets"}>
                          <ActionIcon
                            onClick={async () => {
                              await moveToSessionAssets(item.id);
                            }}
                          >
                            <IconChevronUp size={"sm"} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label={"Move to other Assets"}>
                          <ActionIcon
                            onClick={async () => {
                              await moveToOtherAssets(item.id);
                            }}
                          >
                            <IconChevronDown size={"sm"} />
                          </ActionIcon>
                        </Tooltip>
                        <ActionIcon
                          onClick={async () => {
                            await deleteAssets(item.id);
                          }}
                        >
                          <IconTrash size={"sm"} color={"red"} />
                        </ActionIcon>
                      </Group>

                      <Flex gap={"xl"}>
                        {/* <Button */}
                        {/*   w={"100%"} */}
                        {/*   size="md" */}
                        {/*   variant="outline" */}
                        {/*   onClick={() => { */}
                        {/*     setStepStatus(false); */}
                        {/*     stepOpen(); */}
                        {/*     //   setStepKey(index); */}
                        {/*   }} */}
                        {/* > */}
                        {/*   {index === stepKey ? stepValue : "Use in Any Step"} */}
                        {/* </Button> */}
                        {/* <Button */}
                        {/*   w={"100%"} */}
                        {/*   size="md" */}
                        {/*   color="gray" */}
                        {/*   variant="outline" */}
                        {/*   leftIcon={<IconCircleX size={"1.2rem"} />} */}
                        {/*   onClick={() => { */}
                        {/*     fetch(`${API_URL}/client/update_asset`, { */}
                        {/*       method: "POST", */}
                        {/*       headers: { */}
                        {/*         Authorization: `Bearer ${userToken}`, */}
                        {/*         "Content-Type": "application/json", */}
                        {/*       }, */}
                        {/*       body: JSON.stringify({ */}
                        {/*         ...item, */}
                        {/*         client_archetype_ids: [], */}
                        {/*         asset_id: item.id, */}
                        {/*       }), */}
                        {/*     }).then(() => { */}
                        {/*       props.fetchAssets(); */}
                        {/*       showNotification({ */}
                        {/*         title: "Asset removed from campaigns", */}
                        {/*         message: "Asset removed from campaigns", */}
                        {/*       }); */}
                        {/*     }); */}
                        {/*   }} */}
                        {/* > */}
                        {/*   Stop Using */}
                        {/* </Button> */}
                      </Flex>
                    </Flex>
                  </Grid.Col>
                );
              })}
            </Grid>
          </ScrollArea>
        </Collapse>
        <Flex gap={"sm"} align={"center"} w={"100%"}>
          <Text sx={{ whiteSpace: "nowrap" }} color="gray" fw={500}>
            Other Assets
          </Text>
          <Divider w={"100%"} />
          <ActionIcon onClick={otherToggle}>
            {openedOther ? <IconChevronUp /> : <IconChevronDown />}
          </ActionIcon>
        </Flex>
        <Collapse in={openedOther && otherAssets.length > 0}>
          <TextInput
            style={{ margin: "0px 0px 8px 0px" }}
            placeholder={"Search for Assets..."}
            onChange={(e) => setTextFilterOther(e.currentTarget.value ?? "")}
          />
          <ScrollArea h={700}>
            <Grid>
              {otherAssets
                ?.filter((item) => {
                  return item.asset_key
                    .toLowerCase()
                    .includes(textFilterOther.toLowerCase());
                })
                .map((item: AssetType, index: number) => {
                  return (
                    <Grid.Col
                      span={window.location.href.includes("selix") ? 6 : 4}
                      key={index}
                    >
                      <Flex
                        style={{
                          border: "1px solid #ced4da",
                          borderRadius: "8px",
                        }}
                        p={"sm"}
                        direction={"column"}
                        gap={"sm"}
                      >
                        <Flex align={"center"} justify={"space-between"}>
                          {item.asset_type === "PDF" && (
                            <Button
                              radius={"xl"}
                              size="xs"
                              variant="light"
                              rightIcon={<IconChevronRight size={"1rem"} />}
                              onClick={assetOpen}
                            >
                              View PDF
                            </Button>
                          )}
                        </Flex>
                        <Flex gap={"5px"}>
                          <Badge
                            size="sm"
                            color={
                              item.asset_type === "PDF"
                                ? "pink"
                                : item?.asset_type === "URL"
                                ? "orange"
                                : "green"
                            }
                          >
                            {item?.asset_tag}
                          </Badge>
                          {/* <Badge variant="outline" color="gray" size="lg"> */}
                          {/*   type: {item?.asset_type} */}
                          {/* </Badge> */}
                        </Flex>
                        <Flex align={"center"} w={"fit-content"}>
                          <Text fw={700} lineClamp={1} w={"100%"} size={"md"}>
                            {item?.asset_key}
                          </Text>
                        </Flex>
                        <Flex
                          p={"md"}
                          direction={"column"}
                          gap={"xs"}
                          bg={item?.asset_raw_value ? "#fff5ff" : "#f4f9ff"}
                          style={{ borderRadius: "8px" }}
                        >
                          {/* {!item?.asset_raw_value && (
                        <Flex align={'center'} justify={'space-between'}>
                          <Text
                            color='#ec58fb'
                            size={'lg'}
                            fw={700}
                            style={{ display: 'flex', alignItems: 'center', gap: '3px' }}
                          >
                            <IconSparkles size={'1.4rem'} fill='pink' /> AI Summary
                          </Text>
                          <IconEdit color='gray' size={'1.2rem'} />
                        </Flex>
                      )} */}
                          <Flex align={"end"}>
                            <LineClampText
                              content={
                                item?.asset_raw_value || item?.asset_value
                              }
                            />
                            {true && (
                              <Flex onClick={() => setEditAsset(item)}>
                                <IconEdit color="gray" size={"1.2rem"} />
                              </Flex>
                            )}
                          </Flex>
                        </Flex>
                        <Group>
                          <Text
                            style={{
                              display: "flex",
                              gap: "8px",
                              alignItems: "center",
                            }}
                            fw={500}
                            color="gray"
                            size={"sm"}
                          >
                            # Sends:{" "}
                            <Text
                              fw={500}
                              color={item?.num_sends > 50 ? "green" : "orange"}
                            >
                              {item?.num_sends}
                            </Text>
                          </Text>
                          <Divider orientation="vertical" />
                          <Tooltip label={"Move to Baseline Assets"}>
                            <ActionIcon
                              onClick={async () => {
                                await moveToBaselineAssets(item.id);
                              }}
                            >
                              <IconChevronUp size={"sm"} />
                            </ActionIcon>
                          </Tooltip>
                          <ActionIcon
                            onClick={async () => {
                              await deleteAssets(item.id);
                            }}
                          >
                            <IconTrash size={"sm"} color={"red"} />
                          </ActionIcon>
                        </Group>

                        <Flex gap={"xl"}>
                          {/* <Button */}
                          {/*   w={"100%"} */}
                          {/*   size="md" */}
                          {/*   variant="outline" */}
                          {/*   onClick={() => { */}
                          {/*     setStepStatus(false); */}
                          {/*     stepOpen(); */}
                          {/*     //   setStepKey(index); */}
                          {/*   }} */}
                          {/* > */}
                          {/*   {index === stepKey ? stepValue : "Use in Any Step"} */}
                          {/* </Button> */}
                          {/* <Button */}
                          {/*   w={"100%"} */}
                          {/*   size="md" */}
                          {/*   color="gray" */}
                          {/*   variant="outline" */}
                          {/*   leftIcon={<IconCircleX size={"1.2rem"} />} */}
                          {/*   onClick={() => { */}
                          {/*     fetch(`${API_URL}/client/update_asset`, { */}
                          {/*       method: "POST", */}
                          {/*       headers: { */}
                          {/*         Authorization: `Bearer ${userToken}`, */}
                          {/*         "Content-Type": "application/json", */}
                          {/*       }, */}
                          {/*       body: JSON.stringify({ */}
                          {/*         ...item, */}
                          {/*         client_archetype_ids: [], */}
                          {/*         asset_id: item.id, */}
                          {/*       }), */}
                          {/*     }).then(() => { */}
                          {/*       props.fetchAssets(); */}
                          {/*       showNotification({ */}
                          {/*         title: "Asset removed from campaigns", */}
                          {/*         message: "Asset removed from campaigns", */}
                          {/*       }); */}
                          {/*     }); */}
                          {/*   }} */}
                          {/* > */}
                          {/*   Stop Using */}
                          {/* </Button> */}
                        </Flex>
                      </Flex>
                    </Grid.Col>
                  );
                })}
            </Grid>
          </ScrollArea>
        </Collapse>
      </Stack>
      <Modal
        size={700}
        opened={useModalOpened}
        onClose={useClose}
        withCloseButton={false}
        styles={{
          body: {
            padding: "30px",
            height: "auto",
          },
        }}
      >
        <Flex justify={"space-between"} align={"center"}>
          <Text fw={600} size={23}>
            Asset Relevancy
          </Text>
          <ActionIcon onClick={useClose}>
            <IconCircleX />
          </ActionIcon>
        </Flex>
        <Flex mt={"lg"} align={"center"}>
          <Text w={"100%"} fw={500}>
            How is this asset relevant to the prospects in{" "}
            <span style={{ color: "#228be6" }}>
              `Department of Defense healthcare decision makers`
            </span>
            ?
          </Text>
          <Box
            w={"100%"}
            sx={{
              border: "1px solid #e3e6ec",
              borderRadius: "8px",
              borderStyle: "dashed",
            }}
            p={"md"}
            bg={"#f7f8fa"}
          >
            <Text tt={"uppercase"} color="gray" size={"sm"}>
              example contact:
            </Text>
            <Flex align={"center"} gap={"xs"} mt={"4px"}>
              <Avatar src="/" size={"md"} radius={"xl"} color="green" />
              <Box>
                <Text size={"md"} fw={600}>
                  {"Donald Bryant"}
                </Text>
                <Text fw={400} size={"xs"}>
                  Chief Revenue Officer, Videra
                </Text>
              </Box>
            </Flex>
          </Box>
        </Flex>
        <Textarea
          placeholder="Enter reason here"
          mt={"md"}
          minRows={5}
          radius={"md"}
          value={reason}
          onChange={(event) => setReason(event.currentTarget.value)}
        />
        <Flex gap={"xl"} mt={"xl"}>
          <Button
            variant="outline"
            color="gray"
            size="md"
            fullWidth
            onClick={useClose}
          >
            Go Back
          </Button>
          <Button
            size="md"
            fullWidth
            onClick={() => {
              useClose();
            }}
          >
            Use Asset
          </Button>
        </Flex>
      </Modal>
      <Modal
        size={700}
        opened={stepModalOpened}
        onClose={stepClose}
        withCloseButton={false}
        styles={{
          body: {
            padding: "30px",
            height: "auto",
          },
        }}
      >
        <Flex justify={"space-between"} align={"center"}>
          <Text fw={600} size={23}>
            Use in Step
          </Text>
          <ActionIcon onClick={stepClose}>
            <IconCircleX />
          </ActionIcon>
        </Flex>
        <Select
          data={[
            "Use in Any Step",
            "Use in Step #1",
            "Use in Step #2",
            "Use in Step #3",
          ]}
          styles={{
            item: {
              borderBottom: "1px solid #ced4da",
              borderBottomRightRadius: "0px",
              borderBottomLeftRadius: "0px",
              paddingInline: "10px",
              paddingBlockEnd: "4px",
            },
          }}
          defaultValue="Use in Any Step"
          mt={"md"}
          value={stepData}
          onChange={(value: string) => {
            setStepData(value);
          }}
        />
        {/* <Flex gap={"xl"} mt={"xl"}> */}
        {/*   <Button */}
        {/*     variant="outline" */}
        {/*     color="gray" */}
        {/*     size="md" */}
        {/*     fullWidth */}
        {/*     onClick={stepClose} */}
        {/*   > */}
        {/*     Go Back */}
        {/*   </Button> */}
        {/*   <Button */}
        {/*     size="md" */}
        {/*     fullWidth */}
        {/*     onClick={() => { */}
        {/*       setStepStatus(true); */}
        {/*       useClose(); */}
        {/*       setStepValue(stepData); */}
        {/*     }} */}
        {/*   > */}
        {/*     Use */}
        {/*   </Button> */}
        {/* </Flex> */}
      </Modal>
      <Modal
        size={700}
        opened={assetModalOpened}
        onClose={assetClose}
        withCloseButton={false}
        styles={{
          body: {
            padding: "30px",
            height: "auto",
          },
        }}
      >
        <Flex justify={"space-between"} align={"center"}>
          <Text fw={600} size={23}>
            Asset Preview
          </Text>
          <ActionIcon onClick={assetClose}>
            <IconCircleX />
          </ActionIcon>
        </Flex>
        <Flex
          direction={"column"}
          bg={"#f5f9fe"}
          gap={"md"}
          p={"lg"}
          mt={"md"}
          sx={{
            border: "1px solid #a4c7f8",
            borderRadius: "8px",
            borderStyle: "dashed",
          }}
        >
          <Box>
            <Text color="gray" fw={500} size={"sm"}>
              Asset Title:
            </Text>
            <Text fw={500}>{"Behaviroal Health ROL"}</Text>
          </Box>
          <Box>
            <Text color="gray" fw={500} size={"sm"}>
              Asset Assigned to:
            </Text>
            <Text fw={500}>{"West Coast Campaign"}</Text>
          </Box>
          <Flex gap={"md"}>
            <Box w={"100%"}>
              <Text color="gray" fw={500} size={"sm"}>
                Asset Type:
              </Text>
              <Text fw={500}>{"Case Study"}</Text>
            </Box>
            <Box w={"100%"}>
              <Text color="gray" fw={500} size={"sm"}>
                Ingestion Method:
              </Text>
              <Text fw={500}>{"PDF"}</Text>
            </Box>
          </Flex>
          <Box w={"50%"}>
            <Text color="gray" fw={500} size={"sm"}>
              Asset File:
            </Text>
            <Flex
              gap={"sm"}
              p={"xs"}
              mt={"4px"}
              sx={{ border: "1px solid #82b2f5", borderRadius: "8px" }}
            >
              <Flex h={"100%"}>
                <IconFileTypePdf size={"2.6rem"} color="red" />
              </Flex>
              <Box>
                <Flex gap={"5px"} align={"center"}>
                  <Text size={"sm"}>{"Behavirour.pdf"}</Text>
                  <IconExternalLink size={"1rem"} color="#228be6" />{" "}
                </Flex>
                <Text color="gray" size={"xs"}>
                  200 KB
                </Text>
              </Box>
            </Flex>
          </Box>
        </Flex>
        <Flex gap={"xl"} mt={"xl"}>
          <Button
            variant="outline"
            color="gray"
            size="md"
            fullWidth
            onClick={assetClose}
          >
            Go Back
          </Button>
          <Button
            size="md"
            fullWidth
            onClick={() => {
              assetClose();
            }}
          >
            Edit Asset
          </Button>
        </Flex>
      </Modal>
    </>
  );
}
