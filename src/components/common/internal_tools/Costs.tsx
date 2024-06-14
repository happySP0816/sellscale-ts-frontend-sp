import React, { useState, useEffect } from 'react';
import { Select, Box, Title, Divider, Paper, Button, Drawer, Group, TextInput, NumberInput, Switch, Popover, Text, Loader } from '@mantine/core';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title as ChartTitle, Tooltip, Legend } from 'chart.js';
import { IconQuestionMark } from '@tabler/icons-react';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import { useRecoilState, useRecoilValue } from 'recoil';
import { getClientSpending, getClientsList } from '@utils/requests/costRequests';
import SpendingChart from './SpendingChart';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTitle, Tooltip, Legend);

interface Client {
    id: string;
    company: string;
    spending: {
        apollo: Record<string, number>;
        domains: Record<string, number>;
        email_outbound: Record<string, number>;
        linkedin_outbound: Record<string, number>;
        phantombuster: Record<string, number>;
    };
}

const clients: Client[] = [
];

const ClientSpending: React.FC = () => {
    const [selectedClient, setSelectedClient] = useState<string>(clients[0]?.id);
    const [clientSpending, setClientSpending] = useState<Client['spending'] | null>(clients[0]?.spending);
    const [drawerOpened, setDrawerOpened] = useState(false);
    const [loadingClients, setLoadingClients] = useState(true);

    const userToken = useRecoilValue(userTokenState);

    useEffect(() => {
        const fetchAllClients = async () => {
            setLoadingClients(true);
            const response = await getClientsList(userToken);
            if (response.status === 'success') {
                clients.push(...response.data);
                if (clients.length > 0) {
                    console.log('Clients list:', clients);
                }
            } else {
                console.error('Failed to fetch clients list:', response.message);
            }
            setLoadingClients(false);
        };

        fetchAllClients();
    }, [userToken]);

    useEffect(() => {
        if (selectedClient) {
            const client = clients.find((c) => c.id === selectedClient);
            setClientSpending(client ? client.spending : null);
        }
    }, [selectedClient]);

    const allDates = [
        ...Object.keys(clientSpending ? clientSpending.apollo : {}),
        ...Object.keys(clientSpending ? clientSpending.domains : {}),
        ...Object.keys(clientSpending ? clientSpending.email_outbound : {}),
        ...Object.keys(clientSpending ? clientSpending.linkedin_outbound : {}),
        ...Object.keys(clientSpending ? clientSpending.phantombuster : {})
    ].map(date => new Date(date));

    const earliestDate = new Date(Math.min(...allDates.map(date => date.getTime())));

    const labels = [];
    const currentDate = new Date(earliestDate);
    const today = new Date();
    while (currentDate <= today) {
        labels.push(currentDate.toLocaleString('default', { month: 'short', year: 'numeric' }));
        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return (
        <Paper
            radius="md"
            sx={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                padding: '2rem',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
            }}
        >
            <Paper
                mb="xl"
                radius="md"
                sx={{
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
            >
                <Title
                    order={2}
                    mt="lg"
                    align="center"
                    mb="md"
                    sx={{
                        color: '#2c3e50',
                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    Client Spending Overview
                </Title>
            </Paper>
            {loadingClients ? (
                <Loader size="lg" />
            ) : (
                <Select
                    label="Select Client"
                    placeholder="Choose a client"
                    data={clients.map((client) => ({ value: client.id.toString(), label: client.company }))}
                    value={selectedClient || 'SellScale'}
                    onChange={(value) => setSelectedClient(value || '')}
                    mb="xl"
                    sx={{
                        width: '300px',
                        borderColor: '#2c3e50',
                        '&:hover': { borderColor: '#2980b9' }
                    }}
                />
            )}
            <SpendingChart isInternal={true} selectedClient={Number(selectedClient)} />
            <Button
                onClick={() => setDrawerOpened(!drawerOpened)}
                sx={{
                    position: 'fixed',
                    right: 0,
                    top: '50%',
                    zIndex: 1000,
                    backgroundColor: '#2980b9',
                    color: '#fff',
                    '&:hover': { backgroundColor: '#3498db' }
                }}
            >
                Plan Settings
            </Button>
            <Drawer
                opened={drawerOpened}
                onClose={() => setDrawerOpened(false)}
                title="Client Plan Settings"
                padding="md"
                size="lg"
                position="right"
                sx={{
                    background: 'linear-gradient(135deg, #c3cfe2 0%, #f5f7fa 100%)',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                }}
            >
                <TextInput
                    label="Client Name"
                    placeholder="Enter client name"
                    mb="md"
                    sx={{
                        borderColor: '#2c3e50',
                        '&:hover': { borderColor: '#2980b9' }
                    }}
                />
                <NumberInput
                    label="Monthly Budget"
                    placeholder="Enter budget"
                    mb="md"
                    sx={{
                        borderColor: '#2c3e50',
                        '&:hover': { borderColor: '#2980b9' }
                    }}
                />
                <NumberInput
                    label="Total Domains"
                    placeholder="Enter total domains"
                    mb="md"
                    sx={{
                        borderColor: '#2c3e50',
                        '&:hover': { borderColor: '#2980b9' }
                    }}
                />
                <Switch
                    label="Enable Notifications"
                    mb="md"
                    sx={{
                        '& .mantine-Switch-input': { backgroundColor: '#2980b9' }
                    }}
                />
                <TextInput
                    label="Contact Email"
                    placeholder="Enter contact email"
                    mb="md"
                    sx={{
                        borderColor: '#2c3e50',
                        '&:hover': { borderColor: '#2980b9' }
                    }}
                />
                <NumberInput
                    label="Expected ROI"
                    placeholder="Enter expected ROI"
                    mb="md"
                    sx={{
                        borderColor: '#2c3e50',
                        '&:hover': { borderColor: '#2980b9' }
                    }}
                />
                <TextInput
                    label="Max Contacts"
                    placeholder="Enter max contacts"
                    mb="md"
                    sx={{
                        borderColor: '#2c3e50',
                        '&:hover': { borderColor: '#2980b9' }
                    }}
                />
                <NumberInput
                    label="Annual Revenue"
                    placeholder="Enter annual revenue"
                    mb="md"
                    sx={{
                        borderColor: '#2c3e50',
                        '&:hover': { borderColor: '#2980b9' }
                    }}
                />
                <Switch
                    label="Active Client"
                    mb="md"
                    sx={{
                        '& .mantine-Switch-input': { backgroundColor: '#2980b9' }
                    }}
                />
                <Button
                    onClick={() => console.log('Calculate')}
                    mb="md"
                    sx={{
                        backgroundColor: '#2980b9',
                        color: '#fff',
                        '&:hover': { backgroundColor: '#3498db' }
                    }}
                >
                    Calculate
                </Button>
                <Button
                    onClick={() => console.log('Update Plan')}
                    mb="md"
                    sx={{
                        backgroundColor: '#2980b9',
                        color: '#fff',
                        '&:hover': { backgroundColor: '#3498db' }
                    }}
                >
                    Update Plan
                </Button>
                <Button
                    onClick={() => console.log('Reset Fields')}
                    mb="md"
                    sx={{
                        backgroundColor: '#2980b9',
                        color: '#fff',
                        '&:hover': { backgroundColor: '#3498db' }
                    }}
                >
                    Reset Fields
                </Button>
                <Button
                    onClick={() => console.log('Save Changes')}
                    mb="md"
                    sx={{
                        backgroundColor: '#2980b9',
                        color: '#fff',
                        '&:hover': { backgroundColor: '#3498db' }
                    }}
                >
                    Save Changes
                </Button>
                <Button
                    onClick={() => console.log('Cancel')}
                    mb="md"
                    sx={{
                        backgroundColor: '#2980b9',
                        color: '#fff',
                        '&:hover': { backgroundColor: '#3498db' }
                    }}
                >
                    Cancel
                </Button>
            </Drawer>
        </Paper>
    );
};

export default ClientSpending;
