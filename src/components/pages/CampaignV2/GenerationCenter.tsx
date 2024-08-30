import React, { useState, useEffect, useRef } from 'react';
import { Button, Flex, Text, Textarea, Loader, Paper, Stack, Center, Badge, Avatar, TextInput, SegmentedControl, Checkbox, ScrollArea, Modal, Box, SimpleGrid, Select } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { API_URL } from '@constants/data';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userTokenState, campaignContactsState } from '@atoms/userAtoms';
import { fetchCampaignContacts } from '@utils/requests/campaignOverview';
import { currentProjectState } from '@atoms/personaAtoms';
import { IconArrowLeft, IconBrandLinkedin, IconCalendar, IconMail, IconMailOpened, IconSend } from '@tabler/icons';
import { Calendar } from '@fullcalendar/core';

export const GenerationCenter: React.FC = () => {

    type JobStatus = {
        attempts: number;
        error_message: string | null;
        id: number;
        outbound_campaign_id: number;
        prospect_id: number;
        status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    };

    type GenerationStatuses = {
        jobs_list: JobStatus[];
        statuses_count: {
            COMPLETED: number;
            FAILED: number;
            IN_PROGRESS: number;
            PENDING: number;
        };
        total_job_count: number;
    };

    type OutboundCampaign = {
        campaign_end_date: string;
        campaign_start_date: string;
        campaign_type: string;
        canonical_name: string;
        client_archetype_id: number;
        client_sdr_id: number;
        cost: number | null;
        ctas: any[]; // Assuming ctas is an array of any type, replace with actual type if known
        id: number;
        is_daily_generation: boolean;
        name: string;
        priority_rating: number;
        prospect_ids: number[];
        receipt_link: string | null;
        status: string;
        uuid: string;
    };

    const [inputText, setInputText] = useState('');
    const [generatedText, setGeneratedText] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [generationType, setGenerationType] = useState('linkedin');
    const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
    const userToken = useRecoilValue(userTokenState);
    const [campaignContacts, setCampaignContacts] = useRecoilState(campaignContactsState);
    const currentProject = useRecoilValue(currentProjectState);
    const [outboundCampaignID, setOutboundCampaignID] = useState<number | null>(null);
    const [campaignUUID, setCampaignUUID] = useState<string | null>(null);
    const [generatedMessageStatus, setGeneratedMessageStatus] = useState<GenerationStatuses | null>(null);
    const [iframeOpen, setIframeOpen] = useState(false);
    const [outboundCampaigns, setOutboundCampaigns] = useState<OutboundCampaign[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(-1);

    useEffect(() => {

        const fetchCampaignsByArchetype = async (archetypeId: number) => {
            if (archetypeId === -1) {
                return;
            }
            try {
                const response = await fetch(`${API_URL}/campaigns/campaigns_by_archetype/${archetypeId}`, {
                    method: 'GET',
                    // headers: {
                    //     'Content-Type': 'application/json',
                    //     Authorization: `Bearer ${userToken}`,
                    // },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch campaigns by archetype');
                }

                const data = await response.json();
                if (data.campaigns) {
                    if (data.campaigns.length === 0) {
                        setCurrentPage(1);
                        setSelectedContacts(filteredContacts ? filteredContacts.slice(0, 5).map(contact => contact.id) : [])
                    }
                    else {
                        setOutboundCampaigns(data.campaigns);
                        setCurrentPage(0);
                        console.log('Campaigns:', data.campaigns);
                    }
                    // You can set the campaigns data to state or use it as needed
                } else {
                    console.log('No campaigns found for the given archetype.');
                }
            } catch (error) {
                console.error('Error fetching campaigns by archetype:', error);
            }
        };

        fetchCampaignsByArchetype(currentProject?.id || -1);



        const fetchInitialContacts = async () => {
            setLoading(true);
            try {
                const initialContacts = await fetchCampaignContacts(userToken, currentProject?.id || -1, 0, 1000, '', false);
                setCampaignContacts(Array.from(new Set(initialContacts.sample_contacts)));
            } catch (error) {
                console.error("Error fetching initial contacts", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialContacts();
    }, []);
    const getGeneratedMessageStatus = async (forceOutboundCampaign?: number) => {
        const campaignID = forceOutboundCampaign || outboundCampaignID;
        if (campaignID && Number.isInteger(campaignID)) {
            try {
                const response = await fetch(`${API_URL}/message_generation/get_generation_status/${campaignID}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${userToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to get generation status');
                }

                const data: GenerationStatuses = (await response.json()).generation_statuses;
                setGeneratedMessageStatus(data);
                console.log('Generation status:', data);
            } catch (error) {
                console.error('Error fetching generation status:', error);
            }
        }
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            getGeneratedMessageStatus();
        }, 5000);

        return () => clearInterval(intervalId);
    }, [outboundCampaignID, userToken]);

    const handleGenerate = async (outboundCampaignID: number) => {
        setLoading(true);
        try {
            // Placeholder request
            const response = await fetch(`${API_URL}/campaigns/${outboundCampaignID}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userToken}`,
                },
                // body: JSON.stringify({ outboundCampaignID, prompt: inputText }),
            });

            if (response.status === 200) {
                setGeneratedText(''); // Clear the generated text as the endpoint does not return JSON
                showNotification({
                    title: 'Generation Has Begun',
                    message: 'Message generation has begun successfully!',
                    color: 'green',
                });
            } else {
                throw new Error('Failed to generate text');
            }
        } catch (error: any) {
            showNotification({
                title: 'Generation Failed',
                message: error.message,
                color: 'red',
            });
        } finally {
            setLoading(false);
            const emptyGenerationStatus: GenerationStatuses = {
                jobs_list: selectedContacts.map(id => ({
                    attempts: 0,
                    error_message: null,
                    id: Math.random(), // Assuming a temporary ID, replace with actual logic if needed
                    outbound_campaign_id: outboundCampaignID,
                    prospect_id: id,
                    status: 'PENDING',
                })),
                statuses_count: {
                    COMPLETED: 0,
                    FAILED: 0,
                    IN_PROGRESS: 0,
                    PENDING: selectedContacts.length,
                },
                total_job_count: selectedContacts.length,
            };

            setGeneratedMessageStatus(emptyGenerationStatus);
        }
    };

    const handleContactClick = (contactId: number) => {
        setSelectedContacts((prevSelected) =>
            prevSelected.includes(contactId)
                ? prevSelected.filter((id) => id !== contactId)
                : [...prevSelected, contactId]
        );
    };

    const filteredContacts = campaignContacts?.filter(contact => {
        const isInSearchTerm = `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.title.toLowerCase().includes(searchTerm.toLowerCase());

        const isInGeneratedMessageStatuses = generatedMessageStatus?.jobs_list.some(job => job.prospect_id === contact.id);

        if (outboundCampaignID) {
            return isInSearchTerm && isInGeneratedMessageStatuses;
        }

        if (generationType === 'linkedin') {
            return isInSearchTerm && !contact.approved_outreach_message_id ;
        }
        if (generationType === 'email') {
            return isInSearchTerm && !contact.approved_prospect_email_id ;
        }

        return isInSearchTerm;
    });


    useEffect(() => {
        if (currentPage === 1 && !campaignUUID) {
            setSelectedContacts(filteredContacts ? filteredContacts.slice(0, 5).map(contact => contact.id) : []);
        }
    }, [currentPage, campaignUUID]);
        

    return (
        <Flex direction="column" gap="lg" p="lg" style={{ backgroundColor: '', borderRadius: '8px' }}>
            {currentPage === 1 ? <> {iframeOpen && (
                <Modal
                    size="100%"
                    opened={iframeOpen}
                    onClose={() => setIframeOpen(false)}
                    styles={{
                        body: {
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100vh', // Ensure the modal body takes full viewport height
                        },
                    }}
                >
                    <Box style={{ width: '100%', height: '100%' }}>
                        <iframe
                            src={`https://sellscale.retool.com/embedded/public/eb93cfac-cfed-4d65-b45f-459ffc546bce#campaign_uuid=${campaignUUID}`}
                            width="100%"
                            height="100%"
                            style={{ border: 'none', flex: 1 }}
                        ></iframe>
                    </Box>
                </Modal>
            )}
                <Button
                    variant="outline"
                    color="blue"
                    leftIcon={<IconArrowLeft size={16} />}
                    onClick={() => setCurrentPage(0)}
                    style={{ borderRadius: '8px' }}
                >
                    Go Back
                </Button>
                {!outboundCampaignID && (
                    <Paper shadow="sm" p="md" withBorder style={{ borderRadius: '8px', backgroundColor: '#f9f9f9', position: 'sticky', top: 50, zIndex: 1 }}>
                        <Flex direction="row" align="center" justify="center" gap="md" style={{ width: '100%' }}>
                            <Paper shadow="sm" p="md" withBorder style={{ borderRadius: '8px', backgroundColor: 'white' }}>
                                <TextInput
                                    placeholder="Filter"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.currentTarget.value)}
                                    style={{ borderRadius: '8px' }}
                                />
                            </Paper>
                            <Paper shadow="sm" p="md" withBorder style={{ borderRadius: '8px', backgroundColor: 'white' }}>
                                <Flex direction="column" align="center" gap="md">
                                    <Text weight={600} size="lg" color="#37414E">Campaign Type</Text>
                                    <SegmentedControl
                                        value={generationType}
                                        onChange={(value: any) => { setGenerationType(value); setSelectedContacts([]); }}
                                        data={[
                                            {
                                                value: "linkedin",
                                                label: (
                                                    <Center style={{ gap: 4 }}>
                                                        <IconBrandLinkedin size={"1.4rem"} fill="#3B85EF" color="white" />
                                                        <Text fw={500}>LinkedIn</Text>
                                                    </Center>
                                                ),
                                            },
                                            {
                                                value: "email",
                                                label: (
                                                    <Center style={{ gap: 4 }}>
                                                        <IconMailOpened size={"1.2rem"} fill="orange" color="white" />
                                                        <Text fw={500}>Email</Text>
                                                    </Center>
                                                ),
                                            },
                                        ]}
                                        style={{ borderRadius: '8px' }}
                                    />
                                </Flex>
                            </Paper>
                            <Paper shadow="sm" p="md" withBorder style={{ borderRadius: '8px', backgroundColor: 'white' }}>
                                <Flex direction="column" align="center" gap="md">
                                    <Text weight={600} size="lg" color="#37414E">Select Contacts</Text>
                                    <Button
                                        variant="outline"
                                        color="blue"
                                        onClick={() => {
                                            if (selectedContacts.length === filteredContacts?.length) {
                                                setSelectedContacts([]);
                                            } else {
                                                setSelectedContacts(filteredContacts ? filteredContacts.map(contact => contact.id) : []);
                                            }
                                        }}
                                        style={{ borderRadius: '8px' }}
                                    >
                                        {selectedContacts.length === filteredContacts?.length ? "Deselect All" : "Select All"}
                                    </Button>
                                    <Button variant="outline" color="blue" onClick={() => setSelectedContacts(filteredContacts ? filteredContacts.slice(0, 5).map(contact => contact.id) : [])} style={{ borderRadius: '8px' }}>
                                        Select Top 5
                                    </Button>
                                </Flex>
                            </Paper>
                        </Flex>
                    </Paper>
                )}
                {!outboundCampaignID && <Flex gap="sm" mt="md" justify="center">
                    {generationType === 'linkedin' ? (
                        <Button
                            loading={loadingMessages}
                            color="blue"
                            onClick={async () => {
                                setLoadingMessages(true);
                                const response = await fetch(`${API_URL}/campaigns/`, {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${userToken}`,
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        prospect_ids: selectedContacts,
                                        campaign_type: 'LINKEDIN',
                                        ctas: [],
                                        client_archetype_id: currentProject?.id,
                                        campaign_start_date: new Date().toISOString(), //now
                                        campaign_end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), //tomorrow
                                        num_prospects: selectedContacts.length,
                                        priority_rating: 10, //can adjust
                                        //   warm_emails: warmEmails
                                    })
                                });
                                const data = await response.json();

                                showNotification({
                                    title: 'LinkedIn Outbound Campaign Created',
                                    message: 'LinkedIn campaign has been created successfully! Generating messages...',
                                    color: 'green',
                                });
                                setLoadingMessages(false);

                                setOutboundCampaignID(data.campaign_id);
                                setCampaignUUID(data.campaign_uuid);
                                handleGenerate(data.campaign_id);
                            }}
                            disabled={loading || selectedContacts.length === 0}
                            leftIcon={<IconBrandLinkedin size={16} />}
                        >
                            {loading ? <Loader size="xs" /> : `Generate LinkedIn Messages (${selectedContacts.length})`}
                        </Button>
                    ) : (
                        <Button
                            loading={loadingMessages}
                            color="teal"
                            onClick={async () => {
                                setLoadingMessages(true);
                                const response = await fetch(`${API_URL}/campaigns/`, {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${userToken}`,
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        prospect_ids: selectedContacts,
                                        campaign_type: 'EMAIL',
                                        //   ctas: ctas,
                                        client_archetype_id: currentProject?.id,
                                        campaign_start_date: new Date().toISOString(), //now
                                        campaign_end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), //tomorrow
                                        num_prospects: selectedContacts.length,
                                        priority_rating: 10, //can adjust
                                        // warm_emails: warmEmails
                                    })
                                });
                                const data = await response.json();

                                showNotification({
                                    title: 'Email Outbound Campaign Created',
                                    message: 'Email campaign has been created successfully! Generating messages...',
                                    color: 'green',
                                });

                                setLoadingMessages(false);
                                setOutboundCampaignID(data.campaign_id);
                                handleGenerate(data.campaign_id);
                            }}
                            disabled={loading || selectedContacts.length === 0}
                            leftIcon={<IconMail size={16} />}
                        >
                            {loading ? <Loader size="xs" /> : `Generate Email Messages (${selectedContacts.length})`}
                        </Button>
                    )}
                </Flex>}
                <ScrollArea style={{ height: 'calc(100vh - 200px)' }}>
                    <Stack spacing="md" style={{ backgroundColor: '#f0f8ff', padding: '1rem', borderRadius: '8px' }}>
                        <SimpleGrid cols={4} spacing="lg">
                            {filteredContacts?.map((contact) => (
                                <Paper
                                    key={contact.id}
                                    shadow="sm"
                                    p="md"
                                    withBorder
                                    style={{
                                        borderRadius: '8px',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        cursor: 'pointer',
                                        ...(selectedContacts.includes(contact.id) && {
                                            boxShadow: '0 0 15px rgba(0, 123, 255, 0.6)',
                                            border: '1px solid #007bff',
                                        }),
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    onClick={() => handleContactClick(contact.id)}
                                >
                                    <Flex direction="column" align="center" gap="md">
                                        <Avatar src={contact.avatar} radius="xl" size="lg" />
                                        <Text weight={500} size="lg">{contact.first_name + ' ' + contact.last_name}</Text>
                                        <Text size="sm" color="dimmed" unselectable="on">{contact.title} at {contact.company}</Text>
                                        <Badge size="md" color={
                                            contact.icp_fit_score === 0 ? "red" :
                                                contact.icp_fit_score === 1 ? "orange" :
                                                    contact.icp_fit_score === 2 ? "yellow" :
                                                        contact.icp_fit_score === 3 ? "green" :
                                                            contact.icp_fit_score === 4 ? "blue" : "gray"
                                        }>
                                            {contact.icp_fit_score === 0 ? "Very Low" :
                                                contact.icp_fit_score === 1 ? "Low" :
                                                    contact.icp_fit_score === 2 ? "Medium" :
                                                        contact.icp_fit_score === 3 ? "High" :
                                                            contact.icp_fit_score === 4 ? "Very High" : "Not Scored"}
                                        </Badge>
                                        {!outboundCampaignID && <Checkbox
                                            checked={selectedContacts.includes(contact.id)}
                                            label="Select Contact"
                                        />}
                                        {generatedMessageStatus?.jobs_list?.find(job => job.prospect_id === contact.id) && (
                                            <Badge size="md" color={
                                                generatedMessageStatus.jobs_list.find(job => job.prospect_id === contact.id)?.status === 'PENDING' ? "yellow" :
                                                    generatedMessageStatus.jobs_list.find(job => job.prospect_id === contact.id)?.status === 'IN_PROGRESS' ? "blue" :
                                                        generatedMessageStatus.jobs_list.find(job => job.prospect_id === contact.id)?.status === 'COMPLETED' ? "green" :
                                                            generatedMessageStatus.jobs_list.find(job => job.prospect_id === contact.id)?.status === 'FAILED' ? "red" : "gray"
                                            }>
                                                {generatedMessageStatus.jobs_list.find(job => job.prospect_id === contact.id)?.status === 'PENDING' ? (
                                                    <>
                                                        <Loader size="xs" /> Pending
                                                    </>
                                                ) : generatedMessageStatus.jobs_list.find(job => job.prospect_id === contact.id)?.status === 'IN_PROGRESS' ? (
                                                    <>
                                                        <IconMailOpened size={16} /> In Progress
                                                    </>
                                                ) : generatedMessageStatus.jobs_list.find(job => job.prospect_id === contact.id)?.status === 'COMPLETED' ? (
                                                    <>
                                                        <IconMail size={16} /> Completed
                                                    </>
                                                ) : generatedMessageStatus.jobs_list.find(job => job.prospect_id === contact.id)?.status === 'FAILED' ? (
                                                    <>
                                                        <IconMail size={16} /> Failed
                                                    </>
                                                ) : null}
                                            </Badge>
                                        )}
                                        {generatedMessageStatus?.jobs_list.find(job => job.prospect_id === contact.id)?.status === 'COMPLETED' && <Button onClick={() => setIframeOpen(true)}>Review</Button>}
                                        {contact.generatedText ? (
                                            <Text align="center" mt="md">{contact.generatedText}</Text>
                                        ) : (
                                            <></>
                                        )}
                                    </Flex>
                                </Paper>
                            ))}
                        </SimpleGrid>
                    </Stack>
                </ScrollArea>
            </> : currentPage === 1 ? (<>

                <Flex justify="center" align="center" style={{ height: '100vh' }}>
                    <Loader size="xl" />
                </Flex>

            </>
            ) : (<>

                <Paper shadow="sm" p="md" withBorder style={{ borderRadius: '8px', backgroundColor: '#f9f9f9', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                    <Flex justify="center" align="center" gap="md" direction="column">
                        <Button color="blue" rightIcon={<IconSend size={16} />} onClick={() => { 
                            setOutboundCampaignID(null); 
                            setCampaignUUID(null); 
                            setCurrentPage(1);
                        }}>
                            Create New Outbound Campaign
                        </Button>
                        <Select
                            label={<Text>Existing Outbound Campaigns</Text>}
                            placeholder="Choose existing"
                            data={outboundCampaigns.length > 0 ? outboundCampaigns.map((campaign: OutboundCampaign) => ({
                                value: campaign.id.toString(),
                                label: campaign.campaign_type === 'LINKEDIN' ? `LinkedIn - ${campaign.name}` :
                                       campaign.campaign_type === 'EMAIL' ? `Email - ${campaign.name}` :
                                       `${campaign.name} - ${campaign.campaign_type}`
                            })) : [{ value: '', label: 'No campaigns available' }]}
                            style={{ width: '100%' }}
                            onChange={(value: any) => {
                                setOutboundCampaignID(parseInt(value));
                                setGenerationType(outboundCampaigns.find(campaign => campaign.id === parseInt(value))?.campaign_type === 'LINKEDIN' ? 'linkedin' : 'email');
                                setCampaignUUID(outboundCampaigns.find(campaign => campaign.id === parseInt(value))?.uuid || null);
                                setCurrentPage(1);
                                getGeneratedMessageStatus(parseInt(value));
                            }}
                        />
                    </Flex>
                </Paper>

            </>)}
        </Flex>
    );
};
