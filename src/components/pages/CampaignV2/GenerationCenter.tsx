import React, { useState, useEffect, useRef } from 'react';
import { Button, Flex, Text, Textarea, Loader, Paper, Stack, Center, Badge, Avatar, TextInput, SegmentedControl, Checkbox, ScrollArea, Modal, Box, SimpleGrid } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { API_URL } from '@constants/data';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userTokenState, campaignContactsState } from '@atoms/userAtoms';
import { fetchCampaignContacts } from '@utils/requests/campaignOverview';
import { currentProjectState } from '@atoms/personaAtoms';
import { IconBrandLinkedin, IconCalendar, IconMail, IconMailOpened } from '@tabler/icons';
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

    const [inputText, setInputText] = useState('');
    const [generatedText, setGeneratedText] = useState('');
    const [loading, setLoading] = useState(false);
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

    useEffect(() => {
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

    useEffect(() => {
        const intervalId = setInterval(async () => {
            if (outboundCampaignID) {
                try {
                    const response = await fetch(`${API_URL}/message_generation/get_generation_status/${outboundCampaignID}`, {
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

        return isInSearchTerm;
    });

    return (
        <Flex direction="column" gap="lg" p="lg" style={{ backgroundColor: '', borderRadius: '8px' }}>
            {iframeOpen && (
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
            {!outboundCampaignID && (
                <Paper shadow="sm" p="md" withBorder style={{ borderRadius: '8px', backgroundColor: '#f9f9f9', position: 'sticky', top: 0, zIndex: 1 }}>
                    <Flex direction="row" align="center" justify="center" gap="md" style={{ width: '100%' }}>
                        <Paper shadow="sm" p="md" withBorder style={{ borderRadius: '8px', backgroundColor: 'white' }}>
                            <TextInput
                                placeholder="Filter"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.currentTarget.value)}
                                style={{ borderRadius: '8px' }}
                            />
                        </Paper>
                        <Flex direction="column" align="center" gap="md">
                            
                            <Paper shadow="sm" p="md" withBorder style={{ borderRadius: '8px' }}>
                                <Flex direction="row" align="center" gap="lg">
                                    <Text weight={600} size="lg" color="#37414E">Select Dates</Text>
                                    <Flex direction="column" align="center" gap="sm">
                                        <Text size="sm" color="dimmed">Start Date</Text>
                                        <Button variant="outline" color="blue" disabled style={{ borderRadius: '8px' }}>
                                            <IconCalendar size={16} style={{ marginRight: '0.5rem' }} />
                                            Select Date
                                        </Button>
                                    </Flex>
                                    <Flex direction="column" align="center" gap="sm">
                                        <Text size="sm" color="dimmed">End Date</Text>
                                        <Button variant="outline" color="blue" disabled style={{ borderRadius: '8px' }}>
                                            <IconCalendar size={16} style={{ marginRight: '0.5rem' }} />
                                            Select Date
                                        </Button>
                                    </Flex>
                                </Flex>
                            </Paper>
                        </Flex>
                        <Paper shadow="sm" p="md" withBorder style={{ borderRadius: '8px', backgroundColor: 'white' }}>
                            <Flex direction="column" align="center" gap="md">
                                <Text weight={600} size="lg" color="#37414E">Campaign Type</Text>
                                <SegmentedControl
                                    value={generationType}
                                    onChange={(value: any) => setGenerationType(value)}
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
                                        if (selectedContacts.length === campaignContacts?.length) {
                                            setSelectedContacts([]);
                                        } else {
                                            setSelectedContacts(campaignContacts ? campaignContacts.map(contact => contact.id) : []);
                                        }
                                    }}
                                    style={{ borderRadius: '8px' }}
                                >
                                    {selectedContacts.length === campaignContacts?.length ? "Deselect All" : "Select All"}
                                </Button>
                                <Button variant="outline" color="blue" onClick={() => setSelectedContacts(campaignContacts ? campaignContacts.slice(0, 5).map(contact => contact.id) : [])} style={{ borderRadius: '8px' }}>
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
                        color="blue"
                        onClick={async () => {
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
                        color="teal"
                        onClick={async () => {
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
        </Flex>
    );
};
