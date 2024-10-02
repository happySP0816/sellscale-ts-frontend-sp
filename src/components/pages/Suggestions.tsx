import React, { useEffect, useState } from 'react';
import { Paper, Text, Flex, ThemeIcon, TextInput, ActionIcon, Modal, Textarea, Select, Button, Title } from '@mantine/core';
import { IconBrain, IconPencil, IconCheck, IconX, IconBulb, IconPlus, IconEye, IconTrash } from '@tabler/icons';
import { openContextModal } from '@mantine/modals';
import { useStrategiesApi } from './Strategy/StrategyApi';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import { useRecoilValue } from 'recoil';
import { API_URL } from '@constants/data';

export default function Suggestions(): JSX.Element {
    type SuggestedMessage = {
        client_id: number;
        id: number;
        name: string;
        status: string;
        strategy_id: number;
        transcript: string;
    };

    const [suggestedMessages, setSuggestedMessages] = useState<SuggestedMessage[]>([]);

    const userToken = useRecoilValue(userTokenState);
    const userData = useRecoilValue(userDataState);


    const [editingIndex, setEditingIndex] = useState(-1);
    const [editingValue, setEditingValue] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ name: '', transcript: '', status: '', strategy_id: '' });
    const [strategies, setStrategies] = useState([]);
    const [fetchingStrategies, setFetchingStrategies] = useState(false);

    const [newUserMessage, setNewUserMessage] = useState('');
    const [newTranscript, setNewTranscript] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const [newStrategyId, setNewStrategyId] = useState('');
    const [editingId, setEditingId] = useState(-1);


    useEffect(() => {
        handleGetAllStrategies();
    }, []);



    const postSuggestion = async (name: string, transcript: string, strategyId: number, status: string) => {

        // if (strategyId === -1) {
        //     strategyId = -1;
        // }

        try {
            const response = await fetch(`${API_URL}/selix/suggestions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
                
                body: JSON.stringify({
                    name,
                    transcript,
                    strategy_id: strategyId,
                    id: editingId,
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to create suggestion');
            }
            const data = await response.json();
            // Refresh suggestions after creating a new one
            getSuggestions();
            return data;
        } catch (error) {
            console.error('Error creating suggestion:', error);
            // Handle error (e.g., show error message to user)
        }
    };


    const getSuggestions = async () => {
        try {
            const response = await fetch(`${API_URL}/selix/suggestions`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch suggestions');
            }
            const data = await response.json();
            setSuggestedMessages(data);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            // Handle error (e.g., show error message to user)
        }
    };

    React.useEffect(() => {
        getSuggestions();
    }, []);


    const {
        isLoading,
        getAllSubscriptions,
        postCreateStrategy,
        getStrategy,
        patchUpdateStrategy,
        postAddArchetypeMapping,
        deleteRemoveArchetypeMapping,
        getAllStrategies,
    } = useStrategiesApi(userToken);

    const handleEdit = (index: number) => {
        const message = suggestedMessages[index];
        if (typeof message === 'object' && 'name' in message) {
            setEditingIndex(index);
            setEditingValue(message.name);
        }
    };

    const handleGetAllStrategies = async () => {
        setFetchingStrategies(true);
        const response = await getAllStrategies();
        setStrategies(response);
        setFetchingStrategies(false);
    };

    //   const handleSave = (index: number) => {
    //     const newMessages = [...suggestedMessages];
    //     newMessages[index] = editingValue;
    //     setSuggestedMessages(newMessages);
    //     setEditingIndex(-1);
    //   };

    const handleCancel = () => {
        setEditingIndex(-1);
    };

    const handleClick = (message: SuggestedMessage) => {
        setNewStatus(message.status);
        setNewUserMessage(message.name);
        setNewStrategyId(message.strategy_id.toString());
        setNewTranscript(message.transcript);
        setEditingId(message.id)
        setModalOpen(true);

    };

    return (
        <>
            <Paper
                withBorder
                p="md"
                radius="lg"
                className="bg-white shadow-lg"
                style={{
                    border: "2px solid #E25DEE",
                    boxShadow: "0 8px 16px rgba(226, 93, 238, 0.2)",
                }}
            >
                <Text fw={700} size="md" color="#E25DEE" mb="sm">
                    💡 Starting Suggestions for {userData.client_name}
                </Text>
                <div className="flex flex-col gap-2">
                    {suggestedMessages.map((message, index) => (
                        <Paper
                            key={index}
                            withBorder
                            p="xs"
                            radius="md"
                            className="hover:border-[#E25DEE] cursor-pointer transition-all duration-300 transform hover:scale-110"
                            style={{
                                boxShadow: "0 6px 12px rgba(226, 93, 238, 0.3)",
                                transition: "box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = "0 12px 24px rgba(226, 93, 238, 0.5)";
                                e.currentTarget.style.transform = "translateY(-4px) scale(1.05)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = "0 6px 12px rgba(226, 93, 238, 0.3)";
                                e.currentTarget.style.transform = "translateY(0) scale(1)";
                            }}
                            onClick={() => handleClick(message)}
                        >
                            <Flex
                                align="center"
                                gap="xs"
                                className="transition-transform duration-300 transform hover:translate-x-2"
                            >
                                <ThemeIcon color="grape" size="xl">
                                    <IconBrain size="1.4rem" />
                                </ThemeIcon>
                                {editingIndex === index ? (
                                    <Flex align="center" style={{ flex: 1 }}>
                                        <TextInput
                                            value={editingValue}
                                            onChange={(e) => setEditingValue(e.currentTarget.value)}
                                            style={{ flex: 1 }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <ActionIcon color="green" onClick={(e) => { e.stopPropagation(); }}>
                                            <IconCheck size="1.125rem" />
                                        </ActionIcon>
                                        <ActionIcon color="red" onClick={(e) => { e.stopPropagation(); handleCancel(); }}>
                                            <IconX size="1.125rem" />
                                        </ActionIcon>
                                    </Flex>
                                ) : (
                                    <>
                                        <Text color="#E25DEE" fw={600} size="sm" className="transition-colors duration-300 hover:text-[#494949]" style={{ flex: 1 }}>
                                            {message.name}
                                        </Text>
                                        <ActionIcon color="red" onClick={(e) => { 
                                            e.stopPropagation(); 
                                            fetch(`${API_URL}/selix/suggestions/${message.id}`, {
                                                method: 'DELETE',
                                                headers: {
                                                    'Authorization': `Bearer ${userToken}`,
                                                },
                                            }).then(() => {
                                                getSuggestions();
                                            }).catch(error => {
                                                console.error('Error deleting suggestion:', error);
                                            });
                                        }}>
                                            <IconTrash size="1.125rem" />
                                        </ActionIcon>
                                    </>
                                )}
                            </Flex>
                        </Paper>
                    ))}
                    <Paper
                        p="md"
                        radius="md"
                        withBorder
                        style={{
                            boxShadow: "0 6px 12px rgba(226, 93, 238, 0.3)",
                            transition: "box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = "0 12px 24px rgba(226, 93, 238, 0.5)";
                            e.currentTarget.style.transform = "translateY(-4px) scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = "0 6px 12px rgba(226, 93, 238, 0.3)";
                            e.currentTarget.style.transform = "translateY(0) scale(1)";
                        }}
                        onClick={() => {
                            setModalData({
                                name: '',
                                transcript: '',
                                status: 'NEW',
                                strategy_id: ''
                            });
                            setNewStrategyId('-1')
                            setModalOpen(true);
                        }}
                    >
                        <Flex
                            align="center"
                            gap="xs"
                            className="transition-transform duration-300 transform hover:translate-x-2"
                        >
                            <ThemeIcon color="grape" size="xl">
                                <IconPlus size="1.4rem" />
                            </ThemeIcon>
                            <Text color="#E25DEE" fw={600} size="sm" className="transition-colors duration-300 hover:text-[#494949]" style={{ flex: 1 }}>
                                Add Suggestion
                            </Text>
                        </Flex>
                    </Paper>
                </div>
            </Paper>

            <Modal
                opened={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Suggestion Details"
                size="lg"
            >
                <Flex direction="column" gap="md">
                    <TextInput
                        label="User Message"
                        value={newUserMessage}
                        onChange={(e) => setNewUserMessage(e.currentTarget.value)}
                    />
                    <Textarea
                        label="Transcript"
                        value={newTranscript}
                        onChange={(e) => setNewTranscript(e.currentTarget.value)}
                        minRows={5}
                    />
                    <Select
                        label="Status"
                        value={newStatus}
                        onChange={(value) => setNewStatus(value || '')}
                        data={['NEW', 'IMPLEMENTED', 'REJECTED']}
                    />
                    <Select 
                        placeholder='Select Strategy'
                        rightSection={
                            <ActionIcon onClick={() => {
                                console.log('new strategy id', newStrategyId);
                                if (newStrategyId === '-1') {
                                    return
                                }
                                handleGetAllStrategies();
                                openContextModal({
                                    modal: "editStrategy",
                                    title: (
                                        <Flex align={"center"} gap={"sm"}>
                                            <IconBulb color="#228be6" size={"1.6rem"} />
                                            <Title order={2}>Create Strategy</Title>
                                        </Flex>
                                    ),
                                    innerProps: {
                                        title: (strategies.find((x: any) => x.id.toString() === newStrategyId) as any)?.title ?? '',
                                        description: (strategies.find((x: any) => x.id.toString() === newStrategyId) as any)?.description ?? '',
                                        archetypes: (strategies.find((x: any) => x.id.toString() === newStrategyId) as any)?.archetypes?.map((x: any) => x.id) ?? [],
                                        status: (strategies.find((x: any) => x.id.toString() === newStrategyId) as any)?.status ?? '',
                                        startDate: new Date((strategies.find((x: any) => x.id.toString() === newStrategyId) as any)?.start_date ?? new Date()),
                                        endDate: new Date((strategies.find((x: any) => x.id.toString() === newStrategyId) as any)?.end_date ?? new Date()),
                                        onSubmit: async (title: string, description: string, archetypes: number[], status: string, startDate: Date, endDate: Date) => {
                                          const response = await patchUpdateStrategy(editingId, title, description, archetypes, status, startDate, endDate);
                                          handleGetAllStrategies();
                                        },
                                      },
                                    size: '80%',
                                });
                            }}>
                                <IconPencil size="1.5rem" color="blue" />
                            </ActionIcon>
                        }
                        label="Strategy"
                        value={newStrategyId}
                        onChange={(value) => setNewStrategyId(value || '')}
                        data={strategies.map((strategy: any) => ({
                            value: strategy.id.toString(),
                            label: strategy.title
                        }))}
                    />
                    <Button
                        color="grape"
                        leftIcon={<IconPlus size={"0.9rem"} />}
                        onClick={() => {
                            openContextModal({
                                modal: "createStrategy",
                                title: (
                                    <Flex align={"center"} gap={"sm"}>
                                        <IconBulb color="#228be6" size={"1.6rem"} />
                                        <Title order={2}>Create Strategy</Title>
                                    </Flex>
                                ),
                                innerProps: {
                                    onSubmit: async (title: string, description: string, archetypes: number[], startDate: Date, endDate: Date) => {
                                        const response = await postCreateStrategy(title, description, archetypes, startDate, endDate);
                                        handleGetAllStrategies();
                                    },
                                },
                                size: '80%',
                            });
                        }}
                    >
                        New Strategy
                    </Button>
                    <Button
                        leftIcon={<IconCheck size="0.9rem" />}
                        onClick={async () => {
                            // Update the suggestion in the frontend state
                            const updatedSuggestions = suggestedMessages.map(msg => {
                                if (typeof msg === 'string' && msg === modalData.name) {
                                    return {
                                        name: modalData.name,
                                        transcript: modalData.transcript,
                                        status: modalData.status,
                                        strategy_id: modalData.strategy_id
                                    };
                                }
                                return msg;
                            });
                            await postSuggestion(newUserMessage, newTranscript, parseInt(newStrategyId, 10), 'NEW');
                            await getSuggestions();
                            // Close the modal
                            setModalOpen(false);
                            setEditingId(-1);
                        }}
                        mt="md"
                        fullWidth
                    >
                        Save Changes
                    </Button>
                </Flex>
            </Modal>
        </>
    );
};

