import React from 'react';
import { useRecoilValue } from 'recoil';
import { userTokenState } from '@atoms/userAtoms';
import { Card } from '@mantine/core';
import CalendarAndScheduling from '@common/settings/CalendarAndScheduling';

interface TaskHandlerConnectCalendarProps {
    data: {},
    onTaskComplete?: () => void;
}

export const TaskHandlerConnectCalendar = (props: TaskHandlerConnectCalendarProps) => {
    return (
        <Card maw={800} sx={{ margin: 'auto' }} mt='36px'>
            <CalendarAndScheduling />
        </Card>
    );
}