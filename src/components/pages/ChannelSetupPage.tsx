import React, { useEffect } from 'react';
import BumpFrameworksPage from './BumpFrameworksPage';

import { Alert, Box, Card, Flex, Text } from '@mantine/core';
import ChannelsSetupSelector from './channels';
import ComingSoonCard from '@common/library/ComingSoonCard';
import EmailSequencingPage from './EmailSequencingPage';
import { currentProjectState } from '@atoms/personaAtoms';
import { useRecoilState, useRecoilValue } from 'recoil';
import { IconArrowUp, IconBulb } from '@tabler/icons-react';
import NurturePage from './NurturePage';
import { useLoaderData } from 'react-router-dom';
import { getCurrentPersonaId, getFreshCurrentProject } from '@auth/core';
import { userTokenState } from '@atoms/userAtoms';

export default function ChannelSetupPage() {
  const { channelType } = useLoaderData() as {
    channelType: string;
  };

  const userToken = useRecoilValue(userTokenState);
  const [selectedChannel, setSelectedChannel] = React.useState(channelType);
  const currentProject = useRecoilValue(currentProjectState);

  return (
    <>
      <ChannelsSetupSelector
        setSelectedChannel={setSelectedChannel}
        selectedChannel={selectedChannel}
        hideChannels={true} />

      {currentProject ?
        <Flex w='100%'>
          <Card
            w='100%'
            mx='lg'
            mb='lg'
            withBorder
          >
            {selectedChannel === 'linkedin' && <BumpFrameworksPage hideTitle />}
            {selectedChannel === 'email' && <EmailSequencingPage hideTitle />}
            {selectedChannel === 'nurture' && (
              <Card>
                <Alert icon={<IconBulb size="1rem" />} title="Coming Soon!" w='60%' m='auto'>
                  Nurture is SellScale's re-engagement platform for prospects who asked you to come back to them in the future. Nurture is currently in development and will be available soon.
                </Alert>
                <Box sx={{ opacity: 0.4 }}>
                  <NurturePage />
                </Box>
              </Card>
            )}
          </Card>
        </Flex>
        :
        <Card withBorder m='xl'>
          <Text align='center'> <IconArrowUp size='0.8rem' /> Choose a campaign to get started <IconArrowUp size='0.8rem' /></Text>
        </Card>
      }
    </>
  );
}