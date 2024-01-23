import { userTokenState } from '@atoms/userAtoms';
import { API_URL } from '@constants/data';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { TaskHandlerLinkedinDisconnected } from './TaskHandlers/TaskHandlerLinkedinDisconnected';
import { Box, Button, Text } from '@mantine/core';
import { IconArrowBack, IconCheck, IconX } from '@tabler/icons';
import axios from 'axios';
import { TaskHandlerReviewLinkedinCampaign } from './TaskHandlers/TaskHandlerReviewLinkedinCampaign';

export interface OperatorDashboardEntry {
    id: number;
    client_sdr_id: number;
    urgency: string;
    tag: string;
    emoji: string;
    title: string;
    subtitle: string;
    cta: string;
    cta_url: string;
    status: string;
    due_date: string;
    task_type: string;
    task_data: string;
}

const TASK_ROUTER: any = {
    'LINKEDIN_DISCONNECTED': {
        component: TaskHandlerLinkedinDisconnected,
        instruction: 'Connect to LinkedIn then mark as complete',
        disabledCompleteButton: true,
    },
    'LINKEDIN_CAMPAIGN_REVIEW': {
        component: TaskHandlerReviewLinkedinCampaign,
        instruction: 'Review the campaign then mark as complete',
        disabledCompleteButton: false
    }
}

const OperatorDashTaskRouter: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const userToken = useRecoilValue(userTokenState);
    const [task, setTask] = useState<OperatorDashboardEntry | null>(null);

    const [fetchingDismiss, setFetchingDismiss] = useState(false);
    const [fetchingComplete, setFetchingComplete] = useState(false);

    const navigate = useNavigate();

    const getTask = async (id: string | undefined | null) => {
        if (!id) {
            return;
        }

        const response = await fetch(`${API_URL}/operator_dashboard/details/${id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${userToken}`,
                'Content-Type': 'application/json',
            }
        });

        const json = await response.json();
        const data = json.data as OperatorDashboardEntry;

        setTask(data)
    }

    const getTaskHandler = (task_type: string | undefined) => {
        if (!task_type) {
            return null;
        }

        const handler = TASK_ROUTER[task_type]?.component;
        if (!handler) {
            return null;
        }
        return handler;
    }

    useEffect(() => {
        getTask(id);
    }, [id])

    const TaskComponent = getTaskHandler(task?.task_type);

    const dismissTask = async (taskId: string) => {
        setFetchingDismiss(true);
        try {
            const response = await axios.post(`${API_URL}/operator_dashboard/dismiss/${taskId}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
            });
            if (response.data.success) {
                console.log('Task dismissed successfully');
            }
            setFetchingDismiss(false);
            navigate('/overview')
        } catch (error) {
            setFetchingDismiss(false);
            console.error('Error dismissing task', error);
        }
    };

    const markTaskComplete = async (taskId: string) => {
        setFetchingComplete(true);
        try {
            const response = await axios.post(`${API_URL}/operator_dashboard/mark_complete/${taskId}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
            });
            if (response.data.success) {
                console.log('Task marked complete successfully');
            }
            setFetchingComplete(false);
            navigate('/overview')
        } catch (error) {
            setFetchingComplete(false);
            console.error('Error marking task complete', error);
        }
    }

    return (
        <Box>
            <Box
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#f0f0f0' }}
            >
                <Button 
                    variant="subtle" 
                    color='gray' 
                    mr='xs' 
                    leftIcon={<IconArrowBack size='0.8rem' />}
                    onClick={() => navigate('/overview')}
                >
                        Go back to tasks
                </Button>

                <Box pr='md' sx={{width: '60%'}}>
                    <Text weight="bold" size="lg">
                        {task?.title}
                    </Text>
                    {task?.subtitle && <Text size="xs" style={{ display: 'block' }}>{task?.subtitle}. Then mark as complete.</Text>}
                </Box>
                
                <Button 
                    variant="outline" 
                    loading={fetchingDismiss} 
                    onClick={() => id ? dismissTask(id) : null} 
                    color='red' 
                    mr='xs' 
                    leftIcon={<IconX size='0.8rem' />}>
                        Dismiss task
                </Button>
                <Button 
                    variant="filled"  
                    color='green' 
                    leftIcon={<IconCheck size='0.8rem' />}
                    loading={fetchingComplete}
                    onClick={() => {
                        id ? markTaskComplete(id) : null
                    }}
                    disabled={task?.task_type ?!TASK_ROUTER[task?.task_type]?.disabledCompleteButton : false}
                >
                    Mark task complete
                </Button>
            </Box>
            {TaskComponent && <TaskComponent data={task?.task_data} onTaskComplete={() => id && markTaskComplete(id)} />}
        </Box>
    );
};

export default OperatorDashTaskRouter;
