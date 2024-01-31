import React from 'react';
import { useRecoilValue } from 'recoil';
import { userTokenState } from '@atoms/userAtoms';
import SlackSettings from '@common/slack/SlackSettings';
import { Card } from '@mantine/core';

interface TaskHandlerConnectSlackProps {
    data: {},
    onTaskComplete?: () => void;
}

export const TaskHandlerConnectSlack = (props: TaskHandlerConnectSlackProps) => {
    return (
        <Card maw={800} sx={{ margin: 'auto' }} mt='36px'>
            <SlackSettings />
        </Card>
    );
}