import React, { useState, useEffect } from 'react';
import { Box, Paper, Loader, Flex, Text } from '@mantine/core';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title as ChartTitle, Tooltip, Legend } from 'chart.js';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import { useRecoilValue } from 'recoil';
import { getClientSpending } from '@utils/requests/costRequests';
import { IconPoint } from '@tabler/icons';

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

const ClientSpending: React.FC<{ isInternal?: boolean, selectedClient?: number }> = ({ isInternal = false, selectedClient }) => {
    const [clientSpending, setClientSpending] = useState<Client['spending'] | null>(clients[0]?.spending);
    const [loadingSpending, setLoadingSpending] = useState(false);
    const [totalSpending, setTotalSpending] = useState(0);
    const [projectedSpending, setProjectedSpending] = useState(0);

    const userToken = useRecoilValue(userTokenState);
    const userData = useRecoilValue(userDataState);

    useEffect(() => {
        const fetchClientSpending = async () => {
            if (userDataState) {
                setLoadingSpending(true);
                const response = await getClientSpending(userToken, selectedClient || userData.client.id);
                if (response.status === 'success') {
                    setClientSpending(transformSpendingData(response.data));
                } else {
                    console.error('Failed to fetch client spending:', response.message);
                }
                setLoadingSpending(false);
            }
        };

        fetchClientSpending();
    }, [userData.client.id, userToken, selectedClient]);

    // NOTE: There is a margin calculated here if isInternal = false
    const transformSpendingData = (data: any) => {
        const transform = (spending: Record<string, string | number>) => {
            return Object.keys(spending).reduce((acc, key) => {
                acc[key] = parseFloat(spending[key] as string) * (isInternal ? 1 : 1.5); //MARGIN
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
        } else {
            setTotalSpending(0);
            setProjectedSpending(0);
        }
    }, [clientSpending, selectedClient]);

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
                label: 'Prospect Credits',
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
                label: 'Linkedin Connections',
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
                position: "top" as const,
                labels: {
                    usePointStyle: true,
                    padding: 20,
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
                    borderDash: [5, 5],
                },
            },
            y: {
                grid: {
                    borderDash: [5, 5],
                },
            },
        },
    };
    return (
        <>
            {loadingSpending ? (
                <Loader size="lg" />
            ) : (
                <Box
                    py={15}
                    px={20}
                    style={{ border: "2px solid #f6f4f7", borderRadius: "6px" }}
                >
                    <Flex align={"center"} gap={"sm"} mb="sm">
                        <Paper
                            withBorder
                            radius={"md"}
                            px={"md"}
                            py={4}
                            w={"100%"}
                            className="flex items-center justify-between"
                        >
                            <Flex align={"center"} gap={3}>
                                <IconPoint fill="#228be6" color="white" size={"2rem"} />
                                <Text color="gray" fw={600}>
                                    Total Spending:
                                </Text>
                            </Flex>
                            <Text fw={600} mr={"sm"}>
                                ${totalSpending.toFixed(2)}
                            </Text>
                        </Paper>
                        <Paper
                            withBorder
                            radius={"md"}
                            px={"md"}
                            py={4}
                            w={"100%"}
                            className="flex items-center justify-between"
                        >
                            <Flex align={"center"} gap={3}>
                                <IconPoint fill="#228be6" color="white" size={"2rem"} />
                                <Text color="gray" fw={600}>
                                    Estimated Spend This Month:
                                </Text>
                            </Flex>
                            <Text fw={600} mr={"sm"}>
                                ${projectedSpending.toFixed(2)}
                            </Text>
                        </Paper>
                    </Flex>
                    {clientSpending && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
                                        <Line data={data} options={options as any} />
                                    </Paper>
                                </Box>
                            </Paper>
                        </Box>
                    )}
                </Box>
            )}

        </>
    );
};

export default ClientSpending;
