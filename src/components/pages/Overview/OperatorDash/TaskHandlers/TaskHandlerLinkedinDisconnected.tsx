import React, { useEffect } from 'react';
import { OperatorDashboardEntry } from '../OperatorDashTaskRouter';
import LinkedInConnectedCard from '@common/settings/LinkedInIntegrationCard';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import { IconLink } from '@tabler/icons';
import { showNotification } from '@mantine/notifications';
import { useQuery } from '@tanstack/react-query';
import { syncLocalStorage } from '@auth/core';

interface TaskHandlerLinkedinDisconnectedData {
    data: {
        client_sdr_id: number;
    },
    onTaskComplete?: () => void;
}

export const TaskHandlerLinkedinDisconnected = (props: TaskHandlerLinkedinDisconnectedData) => {
    const [userData, setUserData] = useRecoilState(userDataState);
    const userToken = useRecoilValue(userTokenState)

    useQuery({
        queryKey: [`query-get-accounts-connected`],
        queryFn: async () => {
        await syncLocalStorage(userToken, setUserData);
        return true;
        },
    });

    useEffect(() => {
        if (userData?.li_voyager_connected) {
            props.onTaskComplete && props.onTaskComplete();
        }
    }, [userData.li_voyager_connected]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '100px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
            <LinkedInConnectedCard 
                connected={userData ? userData.li_voyager_connected : false} 
                onConnect={() => {
                    showNotification({
                        title: 'LinkedIn connected!',
                        message: 'Feel free to mark this task as complete.',
                        color: 'blue',
                        icon: <IconLink size="sm" />,
                        autoClose: true
                    })
                }}
            />
        </div>
    );
}