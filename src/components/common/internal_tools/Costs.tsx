import React, { useState, useEffect } from 'react';
import { Select, Box, Title, Divider, Paper, Button, Drawer, Group, TextInput, NumberInput, Switch, Popover, Text, Loader } from '@mantine/core';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title as ChartTitle, Tooltip, Legend } from 'chart.js';
import { IconQuestionMark } from '@tabler/icons-react';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import { useRecoilState, useRecoilValue } from 'recoil';
import { getClientSpending, getClientsList } from '@utils/requests/costRequests';

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

const graphWidth = 800;

const clients: Client[] = [
];

const ClientSpending: React.FC = () => {
    const [selectedClient, setSelectedClient] = useState<string | null>(clients[0]?.id);
    const [clientSpending, setClientSpending] = useState<Client['spending'] | null>(clients[0]?.spending);
    const [drawerOpened, setDrawerOpened] = useState(false);
    const [loadingClients, setLoadingClients] = useState(true);
    const [loadingSpending, setLoadingSpending] = useState(false);
    const [totalSpending, setTotalSpending] = useState(0);
    const [projectedSpending, setProjectedSpending] = useState(0);

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
        const fetchClientSpending = async () => {
            if (selectedClient) {
                setLoadingSpending(true);
                const response = await getClientSpending(userToken, parseInt(selectedClient));
                if (response.status === 'success') {
                    setClientSpending(transformSpendingData(response.data));
                } else {
                    console.error('Failed to fetch client spending:', response.message);
                }
                setLoadingSpending(false);
            }
        };

        fetchClientSpending();
    }, [selectedClient, userToken]);

    useEffect(() => {
        if (selectedClient) {
            const client = clients.find((c) => c.id === selectedClient);
            setClientSpending(client ? client.spending : null);
        }
    }, [selectedClient]);

    const transformSpendingData = (data: any) => {
        const transform = (spending: Record<string, string | number>) => {
            return Object.keys(spending).reduce((acc, key) => {
                acc[key] = parseFloat(spending[key] as string);
                return acc;
            }, {} as Record<string, number>);
        };

        return {
            apollo: transform(data.apollo),
            domains: transform(data.domains),
            email_outbound: transform(data.email_outbound),
            linkedin_outbound: transform(data.linkedin_outbound),
            phantombuster: transform(data.phantombuster),
        };
    };

    const calculateTotalSpending = (spending: Client['spending']) => {
        return Object.values(spending).reduce((acc, serviceSpending) => {
            return acc + Object.values(serviceSpending).reduce((serviceAcc, value) => serviceAcc + value, 0);
        }, 0);
    };
    const calculateProjectedSpending = (spending: Client['spending']) => {
        console.log('Spending:', spending);
        const currentMonth = new Date().getMonth() + 1; // Get the current month (1-12)
        const months = Array.from({ length: 11 }, (_, i) => currentMonth - 11 + i).sort((a, b) => a - b); // Ensure months are in ascending order
        const monthlyTotals = months.map((month) => {
            return Object.values(spending).reduce((acc, serviceSpending) => {
                const monthKey = Object.keys(serviceSpending).find(key => new Date(key).getMonth() + 1 === month);
                return acc + (serviceSpending[monthKey as string] || 0);
            }, 0);
        });

        const lastTwoMonthsTotal = monthlyTotals.slice(-2).reduce((acc, value) => acc + value, 0);
        if (lastTwoMonthsTotal < 1) {
            return 0;
        }
        const n = months.length;
        const sumX = months.reduce((acc, value) => acc + value, 0);
        const sumY = monthlyTotals.reduce((acc, value) => acc + value, 0);
        const sumXY = months.reduce((acc, value, index) => acc + value * monthlyTotals[index], 0);
        const sumX2 = months.reduce((acc, value) => acc + value * value, 0);

        const denominator = (n * sumX2 - sumX * sumX);
        if (denominator === 0 || isNaN(denominator)) {
            return 0; // Avoid division by zero or NaN
        }

        const slope = (n * sumXY - sumX * sumY) / denominator;
        const intercept = (sumY - slope * sumX) / n;

        // Project the spending for the next month (currentMonth + 1)
        const projectedSpending = slope * (currentMonth + 1) + intercept;

        return isNaN(projectedSpending) ? 0 : projectedSpending;
    };

    useEffect(() => {
        if (clientSpending) {
            setTotalSpending(calculateTotalSpending(clientSpending));
            setProjectedSpending(calculateProjectedSpending(clientSpending));
            console.log('Total Spending:', totalSpending);
            console.log('Projected Spending:', projectedSpending);
        } else {
            setTotalSpending(0);
            setProjectedSpending(0);
        }
    }, [clientSpending]);

    const allDates = [
        ...Object.keys(clientSpending ? clientSpending.apollo : {}),
        ...Object.keys(clientSpending ? clientSpending.domains : {}),
        ...Object.keys(clientSpending ? clientSpending.email_outbound : {}),
        ...Object.keys(clientSpending ? clientSpending.linkedin_outbound : {}),
        ...Object.keys(clientSpending ? clientSpending.phantombuster : {})
    ].map(date => new Date(date));

    const earliestDate = new Date(Math.min(...allDates.map(date => date.getTime())));
    const latestDate = new Date(Math.max(...allDates.map(date => date.getTime())));

    const labels = [];
    const currentDate = new Date(earliestDate);
    const today = new Date();
    while (currentDate <= today) {
        labels.push(currentDate.toLocaleString('default', { month: 'short', year: 'numeric' }));
        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    const createMonthlyData = (spending: Record<string, number | string>) => {
        const monthlyData = Array(labels.length).fill(0);
        Object.keys(spending).forEach(date => {
            const [year, month] = date.split('-').map(Number);
            const dateObj = new Date(year, month - 1);
            const monthIndex = (dateObj.getFullYear() - earliestDate.getFullYear()) * 12 + dateObj.getMonth() - earliestDate.getMonth() - 1; // Shift left by 1 month
            if (monthIndex >= 0 && monthIndex < monthlyData.length) {
                monthlyData[monthIndex] = parseFloat(spending[date] as string);
            }
        });
        return monthlyData;
    };

    const fillMissingMonths = (data: number[], labels: string[]) => {
        return labels.map((_, index) => data[index] || 0);
    };

    const data = {
        labels,
        datasets: clientSpending ? [
            {
                label: 'Apollo',
                data: fillMissingMonths(createMonthlyData(clientSpending.apollo), labels),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(75, 192, 192, 1)',
            },
            {
                label: 'Domains',
                data: fillMissingMonths(createMonthlyData(clientSpending.domains), labels),
                borderColor: 'rgba(255, 206, 86, 1)',
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                pointBackgroundColor: 'rgba(255, 206, 86, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(255, 206, 86, 1)',
            },
            {
                label: 'Email Outbound',
                data: fillMissingMonths(createMonthlyData(clientSpending.email_outbound), labels),
                borderColor: 'rgba(153, 102, 255, 1)',
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                pointBackgroundColor: 'rgba(153, 102, 255, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(153, 102, 255, 1)',
            },
            {
                label: 'LinkedIn Outbound',
                data: fillMissingMonths(createMonthlyData(clientSpending.linkedin_outbound), labels),
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
            },
            {
                label: 'PhantomBuster',
                data: fillMissingMonths(createMonthlyData(clientSpending.phantombuster), labels),
                borderColor: 'rgba(255, 159, 64, 1)',
                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                pointBackgroundColor: 'rgba(255, 159, 64, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(255, 159, 64, 1)',
            },
        ] : [],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    font: {
                        size: 14,
                    },
                    color: '#333',
                },
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                titleFont: {
                    size: 16,
                },
                bodyFont: {
                    size: 14,
                },
                footerFont: {
                    size: 12,
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#333',
                    font: {
                        size: 12,
                    },
                },
            },
            y: {
                grid: {
                    color: 'rgba(200, 200, 200, 0.2)',
                },
                ticks: {
                    color: '#333',
                    font: {
                        size: 12,
                    },
                },
            },
        },
    };

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
                    onChange={(value) => setSelectedClient(value)}
                    mb="xl"
                    sx={{
                        width: '300px',
                        borderColor: '#2c3e50',
                        '&:hover': { borderColor: '#2980b9' }
                    }}
                />
            )}
            {loadingSpending ? (
                <Loader size="lg" />
            ) : (
                <>
                    <Paper
                        withBorder
                        radius="md"
                        sx={{
                            marginLeft: '1rem',
                            padding: '1rem',
                            background: 'rgba(255, 255, 255, 0.9)',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <Title order={4} mb="md">
                            Total Costs
                            <Popover width={200} position="bottom" withArrow shadow="md">
                                <Popover.Target>
                                    <Button variant="subtle" compact>
                                        <IconQuestionMark size={16} />
                                    </Button>
                                </Popover.Target>
                                <Popover.Dropdown>
                                    <Text size="sm">
                                        Total Spending is the sum of all monthly spendings. Projected Monthly Spending is calculated using a simple linear regression based on historical spending data.
                                    </Text>
                                </Popover.Dropdown>
                            </Popover>
                        </Title>
                        <Text>Total Spending: ${typeof totalSpending === 'number' ? totalSpending.toFixed(2) : '0.00'}</Text>
                        <Text>Estimated Spend This Month: ${typeof projectedSpending === 'number' ? projectedSpending.toFixed(2) : '0.00'}</Text>
                    </Paper>
                    {clientSpending && (
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
                            <Paper
                                withBorder
                                radius="md"
                                w={graphWidth}
                                sx={{
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                <Box sx={{ width: '100%', maxWidth: graphWidth }}>
                                    <Paper radius="md">
                                        <Line data={data} options={options} />
                                    </Paper>
                                </Box>
                            </Paper>
                        </Box>
                    )}
                </>
            )}
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
