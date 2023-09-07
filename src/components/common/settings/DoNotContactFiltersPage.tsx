import { Alert, Card, Tabs } from '@mantine/core'
import { IconAlertCircle, IconBuilding, IconGenderAgender } from '@tabler/icons'
import { Icon3dRotate, IconLifebuoy, IconPlusEqual } from '@tabler/icons-react'
import React from 'react'
import DoNotContactList from './DoNotContactList'

export default function DoNotContactFiltersPage() {
  const [selectedTab, setSelectedTab] = React.useState('sdr-dnc')

    return (
        <Tabs
          value={selectedTab}
          onTabChange={(value) => setSelectedTab(value)}
        >
          <Tabs.List>
            <Tabs.Tab
              value="sdr-dnc"
              icon={<IconLifebuoy size="0.8rem" />}
            >
              SDR Filter
            </Tabs.Tab>
            <Tabs.Tab
              value="company-dnc"
              icon={<IconBuilding size="0.8rem" />}
            >
              Company-Wide Filter
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="sdr-dnc" pt="xs">
           {selectedTab === 'sdr-dnc' && <DoNotContactList forSDR />}
          </Tabs.Panel>

          <Tabs.Panel value="company-dnc" pt="xs">
            <Card withBorder>
                <Alert icon={<IconAlertCircle size="1rem" />} title="Warning" color="orange">
                    This is your entire organizations' Do Not Contact list. This will affect other users.
                </Alert>
            </Card>
            {selectedTab === 'company-dnc' && <DoNotContactList />}
          </Tabs.Panel>
        </Tabs>
    )
}