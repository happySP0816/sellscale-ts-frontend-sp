import React from 'react';
import { OperatorDashboardEntry } from '../OperatorDashTaskRouter';
import LinkedInConnectedCard from '@common/settings/LinkedInIntegrationCard';
import { useRecoilValue } from 'recoil';
import { userDataState } from '@atoms/userAtoms';
import { IconLink } from '@tabler/icons';
import { showNotification } from '@mantine/notifications';

interface TaskHandlerLinkedinDisconnectedData {
    data: {
        client_sdr_id: number;
    }
}

export const TaskHandlerLinkedinDisconnected = (props: TaskHandlerLinkedinDisconnectedData) => {
    const userData = useRecoilValue(userDataState)

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