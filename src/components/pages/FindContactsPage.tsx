import { userTokenState } from "@atoms/userAtoms";
import YourNetworkSection from "@common/your_network/YourNetworkSection";
import { Card, Flex, Tabs, Title, Text, TextInput, Anchor, NumberInput, Tooltip, Button, ActionIcon, Badge, useMantineTheme, Loader, Group, Stack, Box } from "@mantine/core";
import { useForm } from "@mantine/form";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { IconAffiliate, IconBrandLinkedin, IconDatabase, IconDownload } from "@tabler/icons";
import { setPageTitle } from "@utils/documentChange";
import { valueToColor } from "@utils/general";
import getSalesNavigatorLaunches, { getSalesNavigatorLaunch } from "@utils/requests/getSalesNavigatorLaunches";
import postLaunchSalesNavigator from "@utils/requests/postLaunchSalesNavigator";
import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import { SalesNavigatorLaunch } from "src";
import SalesNavigatorComponent from './SalesNavigatorPage';
import IndividualsDashboard from "@common/individuals/IndividualsDashboard";

export default function FindContactsPage() {
  setPageTitle("Find Contacts")

  return (
    <Flex p='lg' direction='column'>
      <Title>Find Contacts</Title>
      <Tabs defaultValue='individuals' mt='md' keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab value='individuals' icon={<IconDatabase size='0.8rem' />}>
            Database
          </Tabs.Tab>
          <Tabs.Tab value='linkedin-sales-navigator' icon={<IconBrandLinkedin size='0.8rem' />}>
            LinkedIn Sales Navigator
          </Tabs.Tab>
          <Tabs.Tab value='your-network' icon={<IconAffiliate size='0.8rem' />}>
            Your Network
          </Tabs.Tab>
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
      </Tabs>
    </Flex>
  );
}