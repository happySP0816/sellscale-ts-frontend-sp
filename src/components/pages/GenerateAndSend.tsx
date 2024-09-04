import { currentProjectState } from "@atoms/personaAtoms";
import { userTokenState } from "@atoms/userAtoms";
import RichTextArea from "@common/library/RichTextArea";
import { API_URL } from "@constants/data";
import { ActionIcon, Avatar, Badge, Box, Button, Center, Flex, LoadingOverlay, Paper, Progress, ScrollArea, SegmentedControl, Stack, Table, Text, Textarea } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconBrandLinkedin, IconEdit, IconGlobe, IconLetterT, IconLoader, IconMail, IconRecordMail, IconX } from "@tabler/icons";
import { IconClockBolt, IconClockCog, IconSparkles } from "@tabler/icons-react";
import { JSONContent } from "@tiptap/react";
import { DataGrid } from "mantine-data-grid";
import { DataTable } from "mantine-datatable";
import { useEffect, useRef, useState } from "react";
import { a } from "react-spring";
import { useRecoilValue } from "recoil";
import { PersonaOverview, ProspectShallow } from "src";

export default function GenerateAndSend({ outboundCampaignId, campaignUUID }: { outboundCampaignId: number | null; campaignUUID: string | null }) {
  interface ContactData {
    avatar: string;
    name: string;
    job: string;
    part: string;
    status: boolean;
    linkedin: boolean;
    email: boolean;
    message: string;
  }

  const [data, setData] = useState<ProspectOutreachInfo[]>([]);

  const [filterData, setFilterData] = useState<ProspectOutreachInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ProspectOutreachInfo | undefined>(data?.[0] || {});
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
  const [approveStatus, setApproveStatus] = useState(false);
  const [regeneratingMessage, setRegeneratingMessage] = useState(false);
  const [updatingMessage, setUpdatingMessage] = useState(false);

  type CampaignAnalytics = {
    "# Acceptances": number | null;
    "# Demos": number | null;
    "# Replies": number | null;
    "# Sent": number | null;
    "Campaign End date": string;
    "Campaign ID": number;
    "Campaign Name": string;
    "Campaign Start date": string;
    "Campaign Type": string;
    "Companies Demos": number | null;
  };

  type CampaignRaw = {
    campaign_end_date: string;
    campaign_start_date: string;
    campaign_type: string;
    canonical_name: string;
    client_archetype_id: number;
    client_sdr_id: number;
    cost: number | null;
    ctas: any[];
    id: number;
    is_daily_generation: boolean;
    name: string;
    priority_rating: number;
    prospect_ids: number[];
    receipt_link: string | null;
    status: string;
    uuid: string;
  };
  type AIResearchAnswer = {
    citations: string[];
    created_at: string;
    id: number;
    is_yes_response: boolean;
    prospect_id: number;
    question_id: number;
    raw_response: string;
    relevancy_explanation: string;
    short_summary: string;
    updated_at: string;
  };

  type ProspectOutreachInfo = {
    ai_approved: boolean;
    ai_approved_2: boolean;
    blocking_problems: any[];
    completion: string;
    completion_2: string;
    few_shot_prompt: string | null;
    full_name: string;
    highlighted_words: any[];
    highlighted_words_2: any[];
    message_id: number;
    message_id_2: number;
    problems: any[];
    message_status: string;
    message_status_2: string;
    prompt: string;
    prospect_email_id?: number;
    prospect_id: number;
    prospect_info: ProspectShallow | undefined;
    ai_research_answers: AIResearchAnswer[];
  };

  type OutboundCampaignInfo = {
    campaign_details: {
      campaign_analytics: CampaignAnalytics;
      campaign_raw: CampaignRaw;
      client_archetype: PersonaOverview;
      prospects: ProspectOutreachInfo[];
    };
    message: string;
  };

  const [outboundCampaignInfo, setOutboundCampaignInfo] = useState<OutboundCampaignInfo | null>(null);
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);
  const [approvingCampaign, setApprovingCampaign] = useState(false);

  const approveCampaign = async () => {

    setApprovingCampaign(true);
    try {
      const response = await fetch(`${API_URL}/campaigns/mark_initial_review_complete`, {
        method: 'POST',
        body: JSON.stringify({
          campaign_id: outboundCampaignInfo?.campaign_details.campaign_raw.id,
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to approve campaign');
      }

      const data = await response.json();
      console.log('Approved campaign:', data);

      showNotification({
        title: 'Campaign Approved',
        message: 'The campaign has been approved successfully',
      });

    } catch (error) {

      showNotification({
        title: 'Failed to approve campaign',
        message: 'An error occurred while approving the campaign',
        color: 'red',
      });

      console.error('Error approving campaign:', error);

  }

  setApprovingCampaign(false);
}

  const handleSave = async (message_id: number, update: string) => {

    //Email
      setUpdatingMessage(true);

      try {
        const response = await fetch(`${API_URL}/message_generation/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            message_id: message_id,
            update: update,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update message');
        }

        const data = await response;
        console.log('Updated message:', data);

        showNotification({
          title: 'Message Updated',
          message: 'The message has been updated successfully',
        });


      } catch (error) {
        console.error('Error updating message:', error);

        showNotification({
          title: 'Failed to update message',
          message: 'An error occurred while updating the message',
          color: 'red',
        });

      }

      setUpdatingMessage(false);

  }


  const patchMessageApproval = async (message_id: number, approval: boolean) => {
    try {
      const response = await fetch(`${API_URL}/message_generation/${message_id}/patch_message_ai_approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          new_ai_approve_status: approval,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to unapprove message');
      }

      const data = await response.json();
      console.log('Unapproved message:', data);


    } catch (error) {
      console.error('Error unapproving message:', error);
    }
  }

  const regenerateMessage = (prospect_id: number, message_id?:number) => async () => {

    console.log('test')

    setRegeneratingMessage(true);

    //Email
    if (outboundCampaignInfo?.campaign_details.campaign_raw.campaign_type === 'EMAIL') {

      try {
        const response = await fetch(`${API_URL}/message_generation/email/body/regenerate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            prospect_id: prospect_id,
            campaign_uuid: campaignUUID,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to regenerate message');
        }

        const data = await response;
        // setMessage(data.completion);
        console.log('Regenerated message:', data);
        //trigger refresh of this component 

      setOutboundCampaignInfo((prevInfo) => {
        if (prevInfo) {
          return {
            ...prevInfo,
          };
        }
        return prevInfo;
      });

      } catch (error) {
        console.error('Error regenerating message:', error);
      }

    }

    //Linkedin
    else {
      
      try {
        const response = await fetch(`${API_URL}/message_generation/pick_new_approved_message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            prospect_id: prospect_id,
            message_id: message_id,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to regenerate message');
        }

        const data = await response;
        // setMessage(data.completion);
        console.log('Regenerated message:', data);
      } catch (error) {
        console.error('Error regenerating message:', error);
      }
    }

    setRegeneratingMessage(false);
  }



  const autoEditMessage = async (message_id: number) => {
    try {
      const response = await fetch(`${API_URL}/ml/get_aree_fix/${message_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch auto-edit message');
      }

      const data = await response.json();
      setMessage(data.completion);
      console.log('Fetched auto-edit message:', data);
      // You can add further processing of the data here if needed
    } catch (error) {
      console.error('Error fetching auto-edit message:', error);
    }
  }


  useEffect(() => {
    const fetchCampaignData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/campaigns/uuid/${campaignUUID}?approved_filter=${'None'}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch campaign data');
        }

        const data: OutboundCampaignInfo = await response.json();
        setOutboundCampaignInfo(data);
        console.log('Fetched campaign data:', data);
      } catch (error) {
        console.error('Error fetching campaign data:', error);
      }
      setLoading(false);
    };

    fetchCampaignData();
  }, [campaignUUID, userToken]);
  
  useEffect(() => {
    if (outboundCampaignInfo) {
      const hasArtProspect = outboundCampaignInfo.campaign_details.prospects.some(prospect => prospect.full_name.toLowerCase().includes('art '));
      if (hasArtProspect) {
        const artProspectIndex = outboundCampaignInfo.campaign_details.prospects.findIndex(prospect => prospect.full_name.toLowerCase().includes('art '));
        console.log('Art prospect:', outboundCampaignInfo.campaign_details.prospects[artProspectIndex]);
      } else {
        console.log('No prospect with name "Art" found');
      }
      const transformedData = outboundCampaignInfo.campaign_details.prospects.map((prospect) => ({
        ...prospect,
      })) as ProspectOutreachInfo[];
      setData(transformedData);
      setFilterData(transformedData);
      setMessage(transformedData[0]?.completion);
      if (transformedData[0]?.completion_2){
        emailBody.current = (transformedData[0]?.completion_2);
        emailBodyRaw.current = (transformedData[0]?.completion_2);
      }
      setSelected(transformedData[0]);

    }
  }, [outboundCampaignInfo]);

  const [message, setMessage] = useState("");
  const emailBody = useRef("");
  const emailBodyRaw = useRef<string | JSONContent>('');
  const [copyAltered, setCopyAltered] = useState(false);

  const [type, setType] = useState("all");

  // This function handles the approval of a selected item. It updates the status of the selected item to true,
  // updates the filtered data, and moves the selection to the next item in the list. If all items are approved,
  // it sets the approveStatus to true.
  const handleApprove = () => {
    if (selectedIndex !== null) {
      const newData = [...data];
      newData[selectedIndex].ai_approved = true;
      setFilterData(newData);
      setSelectedIndex((item) => (item !== null ? (item < data.length - 1 ? item + 1 : 0) : null));
      setSelected(data[selectedIndex < data.length - 1 ? selectedIndex + 1 : 0]);
      if (newData.every((item) => item.ai_approved)) {
        setApproveStatus(true);
      }
    }
  };
  useEffect(() => {}, [selected, selectedIndex]);

  // useEffect(() => {
  //   setMessage(selected.message);
  // }, [selected.message]);

  return (
    <Paper p={"sm"}>
      <Flex justify={"space-between"} align={"center"} p={"sm"}>
        <Flex gap={"xs"} align={"ceter"}>
          <IconEdit color="#228be6" size={"1.2rem"} className="mt-1" />
          <Text size={"lg"} fw={600}>
            {outboundCampaignInfo?.campaign_details.campaign_raw.name}
          </Text>
        </Flex>
        <Flex align={"center"} gap={"sm"}>
          <Badge variant="outline" radius={"sm"} size="lg" color="green" leftSection={<IconClockBolt size={"1rem"} className="mt-2" />}>
            {Math.round(data.length && data.filter(item => item.ai_approved).length / data.length * 100)}%
          </Badge>
          <ActionIcon variant="outline" radius={"xl"}>
            <IconX size={"1.2rem"} />
          </ActionIcon>
        </Flex>
      </Flex>
      <LoadingOverlay visible={loading} overlayBlur={2}/>
      <Flex gap={"sm"} w={"100%"}>
        <Paper bg={"#F7F8FA"} p={"md"} w={"35%"}>
          <SegmentedControl
            fullWidth
            onChange={(value) => {
              setType(value);
              if (value === "warning") {
                setFilterData(data.filter((item) => item.problems.length > 0));
              }
              if (value === "ready") {
                setFilterData(data.filter((item) => item.ai_approved === true && item.message_status !== 'SENT'));
              }
              if (value === "sent") {
                setFilterData(data.filter((item) => item.message_status === 'SENT'));
              }
              if (value === "all") setFilterData(data);
            }}
            data={[
              {
                value: "all",
                label: (
                  <Center style={{ gap: 10 }}>
                    <span>All</span>
                  </Center>
                ),
              },
              {
                value: "warning",
                label: (
                  <Center style={{ gap: 10 }}>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Warning</span>
                  </Center>
                ),
              },

              {
                value: "ready",
                label: (
                  <Center style={{ gap: 10 }}>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Ready to send</span>
                  </Center>
                ),
              },
              {
                value: "sent",
                label: (
                  <Center style={{ gap: 10 }}>
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Sent</span>
                  </Center>
                ),
              },
            ]}
          />
          <ScrollArea 
          h={'100vh'}
          >
          <Table
            highlightOnHover
            withColumnBorders
            // height={"fit-content"}
            withBorder
            // onRowClick={(record, index) => {
            //   setSelected(record);
            //   setSelectedIndex(index);
            // }}
            // rowStyle={(record, index) => {
            //   return { background: index === selectedIndex ? "#3B85EF10" : "white" };
            // }}
            mt={"sm"}
            sx={{
              cursor: "pointer",
              "& .mantine-10xyzsm>tbody>tr>td": {
                padding: "0px",
              },
              "& tr:hover": {
                background: "#f0f0f0",
              },
            }}
          >
            <thead>
              <tr>
                <th>
                  <Flex align={"center"} gap={"3px"}>
                    <Text color="gray">#</Text>
                  </Flex>
                </th>
                <th>
                  <Flex align={"center"} gap={"3px"}>
                    {/* <IconLetterT color="gray" size={"0.9rem"} /> */}
                    <Text color="gray">Prospect</Text>
                  </Flex>
                </th>
                <th>
                  <Flex align={"center"} gap={"3px"}>
                    <IconLoader color="gray" size={"0.9rem"} />
                  </Flex>
                </th>
              </tr>
            </thead>
            <tbody>
              
              {filterData.map((record: ProspectOutreachInfo, index) => (
                <tr
                  key={index}
                  onClick={() => {
                    console.log('selected is', record);
                    setSelected(record);
                    setSelectedIndex(index);
                    setMessage(record.completion || '');
                    if (record.completion_2) {
                      emailBody.current = (record.completion_2);
                      emailBodyRaw.current = (record.completion_2);
                    }
                    setCopyAltered(false);
                  }}
                  style={{ background: index === selectedIndex ? "#3B85EF10" : "white" }}
                >
                  <td>
                    <Flex w={"100%"} h={"100%"} px={4} py={"xs"} align={"center"} justify={"start"}>
                      <Text size={"sm"} fw={500} color="gray">
                        {index + 1}
                      </Text>
                    </Flex>
                  </td>
                  <td>
                    <Flex w={"100%"} gap={"sm"} h={"100%"} px={4} py={"xs"} align={"center"} justify={"start"}>
                      <Avatar src={record.prospect_info?.img_url} size={"md"} radius={"xl"} />
                      <Box>
                        <Flex align={"center"} gap={"xs"}>
                          <Text fw={500}>{record.full_name}</Text>
                          {outboundCampaignInfo?.campaign_details?.campaign_raw?.campaign_type === 'LINKEDIN' && <IconBrandLinkedin fill="#228be6" color="white" size={"1.3rem"} />}
                          {outboundCampaignInfo?.campaign_details?.campaign_raw?.campaign_type === 'EMAIL' && <IconMail fill="#228be6" color="white" size={"1.3rem"} />}
                        </Flex>
                        <Flex>
                          <Text size={"xs"} color="gray" fw={500}>
                            {record.prospect_info?.title}
                          </Text>
                        </Flex>
                        <Flex>
                          <Text size={"xs"} color="gray" fw={500}>
                            {record.prospect_info?.company}
                          </Text>
                        </Flex>
                       {record.message_status === 'SENT' && <Button
                        size="xs"
                        variant="default"
                        compact
                        component="a"
                        target="_blank"
                        href={`/prospects/${record.prospect_id}`}
                      >
                        Open Convo
                      </Button>}
                      </Box>
                    </Flex>
                  </td>
                  <td>
                    <Flex w={"100%"} h={"100%"} align={"center"} px={4} py={"xs"} justify={"start"}>
                      {record.message_status === 'SENT' ? (
                        <div className="rounded-full w-4 h-4 bg-blue-500"></div>
                      ) : record.ai_approved ? (
                        <div className="rounded-full w-4 h-4 bg-green-500"></div>
                      ) : (
                        <div className="rounded-full w-4 h-4 bg-red-600"></div>
                      )}
                    </Flex>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          </ScrollArea>
        </Paper>
        {selected && selected.prospect_info && <Paper bg={"#F7F8FA"} p={"md"} w={"65%"}>
        <Progress
            value={(data.filter(item => item.ai_approved).length / data.length) * 100}
            mb="sm"
            size="xl"
            radius="xl"
            sections={[
              { value: (data.filter(item => item.ai_approved).length / data.length) * 100, color: 'green',  label: `Approved (${((data.filter(item => item.ai_approved).length / data.length) * 100).toFixed(0)}%)` },
              { value: (data.filter(item => !item.ai_approved).length / data.length) * 100, color: 'red', label: `Unapproved (${((data.filter(item => !item.ai_approved).length / data.length) * 100).toFixed(0)}%)` },
            ]}
            label="Campaign Progress"
          />
        {!data.every(item => item.message_status === 'SENT') && <Button mb = 'sm' loading={approvingCampaign} onClick={approveCampaign} size="md" fullWidth disabled={!data.every(item => item.ai_approved)|| outboundCampaignInfo?.campaign_details.campaign_raw.status === 'COMPLETE' }>
          {outboundCampaignInfo?.campaign_details.campaign_raw.status === 'COMPLETE' ? 'Campaign Approved' : 'Finish & Send'}
        </Button>}
          <Stack spacing={"sm"}>
            {selected.message_status !== 'SENT' ? <Flex gap={"sm"}>
              <Button 
                onClick={() => {
                  setSelected((prevSelected) => {
                    if (prevSelected) {
                      return { ...prevSelected, ai_approved: false };
                    }
                    return prevSelected;
                  });

                  setFilterData((prevFilterData) => {
                    return prevFilterData.map((item) =>
                      item.message_id === selected.message_id ? { ...item, ai_approved: false } : item
                    );
                  });

                  setData((prevData) => {
                    return prevData.map((item) =>
                      item.message_id === selected.message_id ? { ...item, ai_approved: false } : item
                    );
                  });

                  patchMessageApproval(selected.message_id, false);
                }}
                disabled={selected.ai_approved === false}
              fullWidth color="red">
                Unapprove Message
              </Button>
              <Button 
                onClick={() => {
                  setSelected((prevSelected) => {
                    if (prevSelected) {
                      return { ...prevSelected, ai_approved: true };
                    }
                    return prevSelected;
                  });

                  setFilterData((prevFilterData) => {
                    return prevFilterData.map((item) =>
                      item.message_id === selected.message_id ? { ...item, ai_approved: true } : item
                    );
                  });

                  setData((prevData) => {
                    return prevData.map((item) =>
                      item.message_id === selected.message_id ? { ...item, ai_approved: true } : item
                    );
                  });

                  handleApprove();
                  patchMessageApproval(selected.message_id, true);
                }}
                disabled={selected.ai_approved === true}
                fullWidth 
                color="green"
              >
                Approve Message
              </Button>
            </Flex> : <Flex gap={"sm"}>
                <Button fullWidth color={'lime'}>
                  Message Sent
                </Button>
              </Flex>}
            <Paper p={"sm"} radius={"sm"} withBorder>
              <Stack spacing={"sm"}>
                <Text fw={600} size={"lg"}>
                  Verify message below
                </Text>
                <Text size={"sm"} fw={600} color="gray">
                  After you verify make sure to select the <span className="text-green-500">Approve</span> button.
                </Text>
                <Flex direction={"column"} align={"end"}>
                  <Paper radius={"sm"} bg={"#D9DEE5"} p={4} style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} mb={-2}>
                    <Text fw={500} size={"xs"} color="gray">
                      {message.length}/300
                    </Text>
                  </Paper>
                  <Textarea
                    w={"100%"}
                    value={message}
                    onChange={(e) => {setCopyAltered(true); setMessage(e.target.value)}}
                    defaultValue={selected.completion}
                    maxRows={4}
                    autosize
                    maxLength={300}
                    styles={{
                      input: {
                        background: "#F7F8FA",
                      },
                    }}
                  />
                </Flex>
                {selected.completion_2 && <Flex direction={"column"} align={"end"}>
                  <Paper radius={"sm"} bg={"#D9DEE5"} p={4} style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} mb={-2}>
                   
                  </Paper>
                  <RichTextArea
                  onChange={(value, rawValue) => {
                    emailBodyRaw.current = rawValue;
                    emailBody.current = value;
                    // setDescription(value);
                    setCopyAltered(true);
                    console.log(value);
                  }}
                  value={emailBodyRaw.current}
                />
                </Flex>}
                <Flex justify={"space-between"} mt={"md"}>
                  <Button onClick={()=> {autoEditMessage(selected.message_id)} } disabled = {true}color="grape" variant="outline" leftIcon={<IconEdit size={"1.3rem"} />}>
                    Auto Edit Using AI
                  </Button>
                  <Flex gap={"sm"}>
                    <Button loading={regeneratingMessage} disabled={true} onClick={regenerateMessage(selected.prospect_id, selected.message_id)} color="grape" leftIcon={<IconSparkles size={"1.3rem"} />}>
                      Regenerate
                    </Button>
                    <Button
                      loading={updatingMessage}
                      onClick={() => {
                        if (outboundCampaignInfo?.campaign_details.campaign_raw.campaign_type === 'EMAIL') {
                          if (selected.message_id_2) {
                            handleSave(selected.message_id_2, emailBody.current);
                          }
                          if (selected.message_id) {
                            handleSave(selected.message_id, message);
                          }
                        } else if (outboundCampaignInfo?.campaign_details.campaign_raw.campaign_type === 'LINKEDIN') {
                          if (selected.message_id) {
                            handleSave(selected.message_id, message);
                          }
                        }
                        setCopyAltered(false);
                        
                        //update the underlying data and filtered data states
                        setFilterData((prevFilterData) => {
                          return prevFilterData.map((item) =>
                            item.message_id === selected.message_id ? { ...item, completion: message } : item
                          );
                        });

                        setData((prevData) => {
                          return prevData.map((item) =>
                            item.message_id === selected.message_id ? { ...item, completion: message } : item
                          );
                        });

                        //check for email body and update if it exists

                        if (selected.completion_2) {
                          setFilterData((prevFilterData) => {
                            return prevFilterData.map((item) =>
                              item.message_id === selected.message_id ? { ...item, completion_2: emailBody.current } : item
                            );
                          });

                          setData((prevData) => {
                            return prevData.map((item) =>
                              item.message_id === selected.message_id ? { ...item, completion_2: emailBody.current } : item
                            );
                          });
                        }



                      }}
                      disabled={!copyAltered}
                      color="blue"
                    >
                      Save
                    </Button>
                  </Flex>
                </Flex>
              </Stack>
            </Paper>
            <Paper p={"sm"} withBorder>
              <Flex justify={"space-between"}>
                <Flex align={"center"} gap={"sm"}>
                  <Avatar src={selected.prospect_info.img_url} size={"lg"} radius={"xl"} />
                  <Box>
                    <Flex align={"center"} gap={"sm"}>
                      <Text fw={600}>{selected?.prospect_info.full_name}</Text>
                      {outboundCampaignInfo?.campaign_details?.campaign_raw?.campaign_type === 'LINKEDIN' && <IconBrandLinkedin fill="#228be6" color="white" size={"1.3rem"} />}
                      {outboundCampaignInfo?.campaign_details.campaign_raw.campaign_type === 'EMAIL' && <IconMail fill="#228be6" color="white" size={"1.3rem"} />}
                    </Flex>
                    <Text color="gray" size={"sm"} fw={500}>
                      {selected?.prospect_info.title}
                    </Text>
                  </Box>
                </Flex>
                <Badge variant="light" color="green">
                  No Errors
                </Badge>
              </Flex>
              <Text color="gray" fw={500} size={"sm"} mt={"sm"}>
                Voice Used: <span className="text-black">{currentProject?.ai_voice_id}</span>
              </Text>
            </Paper>
            {outboundCampaignInfo?.campaign_details?.campaign_raw?.ctas?.length ? (
              <Paper withBorder radius={"sm"} p={"sm"}>
                <Text fw={"600"} size={"lg"}>
                  CTA Used<span className="text-gray-500">(Linkedin only)</span>
                </Text>
                <Paper withBorder radius={"sm"} p={"xs"} mt={"sm"} style={{ borderColor: "#3B85EF", backgroundColor: "#3B85EF10" }}>
                  <Text size={"sm"} fw={500}>
                    {selected.completion}
                  </Text>
                </Paper>
              </Paper>
            ) : null}
            {selected.ai_research_answers.length !== 0 && <Paper withBorder radius={"sm"} p={"sm"}>
              <Text size={"lg"} fw={600}>
                Research
              </Text>
              {selected.ai_research_answers && <Stack spacing={"lg"} mt={"sm"}>
                {selected.ai_research_answers?.map((answer: AIResearchAnswer, index: number) => (
                  <Box key={index}>
                    <Text fw={500} size={"sm"} color="gray">
                      {answer.short_summary}
                    </Text>
                    <Paper ml={"md"} mt={"xs"} withBorder p={"xs"} style={{ borderColor: "#3B85EF", backgroundColor: "#3B85EF10" }}>
                      <Text size={"sm"} fw={500}>
                        {answer.relevancy_explanation}
                      </Text>
                    </Paper>
                  </Box>
                ))}
              </Stack>}
            </Paper>}
          </Stack>
        </Paper>}
      </Flex>
      <Flex mt={"lg"} gap={"md"} mb={"sm"}>
      </Flex>
    </Paper>
  );
}
