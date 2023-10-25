import { userTokenState } from "@atoms/userAtoms";
import YourNetworkSection from "@common/your_network/YourNetworkSection";
import { Card, Flex, Tabs, Title, Text, TextInput, Anchor, NumberInput, Tooltip, Button, ActionIcon, Badge, useMantineTheme, Loader, Group, Stack, Box } from "@mantine/core";
import { useForm } from "@mantine/form";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { IconAffiliate, IconBrandLinkedin, IconDatabase, IconDownload, IconFile } from "@tabler/icons";
import { setPageTitle } from "@utils/documentChange";
import { valueToColor } from "@utils/general";
import getSalesNavigatorLaunches, { getSalesNavigatorLaunch } from "@utils/requests/getSalesNavigatorLaunches";
import postLaunchSalesNavigator from "@utils/requests/postLaunchSalesNavigator";
import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import { SalesNavigatorLaunch } from "src";
import SalesNavigatorComponent from './SalesNavigatorPage';
import IndividualsDashboard from "@common/individuals/IndividualsDashboard";
import { IconCsv } from '@tabler/icons-react';
import FileDropAndPreview from '@modals/upload-prospects/FileDropAndPreview';
import LinkedInURLUpload from '@modals/upload-prospects/LinkedInURLUpload';
import { currentProjectState } from '@atoms/personaAtoms';

export default function FindContactsPage() {
  setPageTitle("Find Contacts")

  const currentProject = useRecoilValue(currentProjectState);
  const activePersona = currentProject?.id;
  const activePersonaEmoji = currentProject?.emoji;
  const activePersonaName = currentProject?.name;

  return (
    <Flex p='lg' direction='column'>
      <Title>Find Contacts: {activePersonaEmoji} {activePersonaName}</Title>
      <Tabs defaultValue='individuals' mt='md' keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab value='individuals' icon={<IconDatabase size='0.9rem' />}>
            SellScale Database
          </Tabs.Tab>
          <Tabs.Tab value='linkedin-sales-navigator' icon={<IconBrandLinkedin size='0.9rem' />}>
            Sales Navigator Link
          </Tabs.Tab>
          <Tabs.Tab value='linkedin-url' icon={<IconBrandLinkedin size='0.9rem' />}>
            LinkedIn URL
          </Tabs.Tab>
          <Tabs.Tab value='by-csv' icon={<IconFile size='0.9rem' />}>
            CSV
          </Tabs.Tab>
          <Tooltip label='Advanced - Linkedin Network' position='bottom'>
            <Tabs.Tab value='your-network' icon={<IconAffiliate size='0.9rem' />} ml='auto'>
              
            </Tabs.Tab>
          </Tooltip>
        </Tabs.List>

        <Tabs.Panel value='individuals' pt='xs'>
          <IndividualsDashboard openFilter={() => {}} />
        </Tabs.Panel>

        <Tabs.Panel value='linkedin-sales-navigator' pt='xs'>
          <SalesNavigatorComponent />
        </Tabs.Panel>

        <Tabs.Panel value='your-network' pt='xs'>
          <YourNetworkSection />
        </Tabs.Panel>

        <Tabs.Panel value="linkedin-url" pt="xs">
          <Card maw='600px' ml='auto' mr='auto'>
            <Title order={3}>
              Upload Prospect from One LinkedIn URL
            </Title>
            <Text mb='md' color='gray'>
              Upload a LinkedIn URL to add a prospect to your database. This can be a Sales Navigator link (i.e. /sales) or a regular LinkedIn profile link (i.e. /in).
            </Text>
            <LinkedInURLUpload afterUpload={() => {
              showNotification({
                title: "Success",
                message: "Uploaded contact successfully",
                color: "teal",
              });
            }}/>
          </Card>
        </Tabs.Panel>
        <Tabs.Panel value="by-csv" pt="xs">
          <Card maw='600px' ml='auto' mr='auto'>
            <Title order={3}>
              Upload CSV
            </Title>
            <Text mb='md' color='gray'>
              Upload a CSV file with the following columns: 
              <ul>
                <li>linkedin_url (required; if no email)</li>
                <li>first_name (optional; required if no linkedin_url)</li>
                <li>last_name (optional; required if no linkedin_url)</li>
                <li>email (optional; required if no linkedin_url)</li>
                <li>company (optional; required if no linkedin_url)</li>
              </ul>
            </Text>
            <FileDropAndPreview
              personaId={activePersona + ''}
              onUploadSuccess={() => {
                showNotification({
                  title: "Success",
                  message: "File uploaded successfully",
                  color: "teal",
                });
              }}
            />
          </Card>
          
        </Tabs.Panel>
      </Tabs>
    </Flex>
  );
}