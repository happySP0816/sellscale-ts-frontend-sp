import React from 'react';
import BumpFrameworksPage from './BumpFrameworksPage';
import { Card } from '@mantine/core';
import ChannelsSetupSelector from './channels';
import ComingSoonCard from '@common/library/ComingSoonCard';
import EmailSequencingPage from './EmailSequencingPage';

export default function ChannelSetupPage() {
  const [selectedChannel, setSelectedChannel] = React.useState('linkedin');
  return (
    <>
      <ChannelsSetupSelector 
        setSelectedChannel={setSelectedChannel}
        selectedChannel='linkedin' />
      <Card ml='lg' mr='lg' mb='lg'>
        {selectedChannel === 'linkedin' && <BumpFrameworksPage hideTitle/>} 
        {selectedChannel === 'email' && <EmailSequencingPage hideTitle />}
        {selectedChannel === 'nurture' && <ComingSoonCard/>}
      </Card>
    </>
  );
}