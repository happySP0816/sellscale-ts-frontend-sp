import React from 'react';
import { Card } from '@mantine/core';
import DoNotContactListV2 from '@common/settings/DoNotContactListV2';

interface TaskHandlerAddDNCFiltersProps {
    data: {},
    onTaskComplete?: () => void;
}

export const TaskHandlerAddDNCFilters = (props: TaskHandlerAddDNCFiltersProps) => {
    return (
        <Card maw={1200} sx={{ margin: 'auto' }} mt='36px'>
            <DoNotContactListV2 forSDR={true} />
        </Card>
    );
}