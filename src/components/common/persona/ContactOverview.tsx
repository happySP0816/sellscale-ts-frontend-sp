import { Tabs } from '@mantine/core'
import { PulseWrapper } from './PulseWrapper'
import ICPFilters from './ICPFilter/ICPFilters'
import { currentProjectState } from '@atoms/personaAtoms'
import { getCurrentPersonaId, getFreshCurrentProject } from '@auth/core'
import { useEffect } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { userTokenState } from '@atoms/userAtoms'
import { useLoaderData, useNavigate } from 'react-router-dom'
import { PersonaOverview } from 'src'
import { getPersonasOverview } from '@utils/requests/getPersonas'
import { navigateToPage } from '@utils/documentChange'
import UploadOverview from './UploadOverview'
import { IconBeta, IconChartArcs, IconChartAreaLine, IconList, IconTable, IconTarget } from '@tabler/icons'
import ComingSoonCard from '@common/library/ComingSoonCard'
import GlobalContacts from './GlobalContacts'
import DoNotContactList from '@common/settings/DoNotContactList'
import PageFrame from '@common/PageFrame'
import UploadOverviewV2 from './UploadOverviewV2'
import TAMGraph from './TAMGraph'
import ScrappingReport from './ScrappingReport'

const ContactOverview = () => {
  return (
    <Tabs defaultValue='overview' className='min-h-full flex flex-col'>
      <Tabs.List>
        <Tabs.Tab value='overview'>
          <IconTable size='0.8rem' style={{ marginRight: '8px', marginTop: '4px' }} />
          Upload Overview
        </Tabs.Tab>
        <Tabs.Tab value='scrapping_report'>
          <IconTable size='0.8rem' style={{ marginRight: '8px', marginTop: '4px' }} />
          Scrapping Report
        </Tabs.Tab>
        <Tabs.Tab value='global_contacts'>
          <IconList size='0.8rem' style={{ marginRight: '8px', marginTop: '4px' }} />
          Global Contacts
        </Tabs.Tab>
        <Tabs.Tab value='do_not_contact'>
          <IconTarget size='0.8rem' style={{ marginRight: '8px', marginTop: '4px' }} />
          Do Not Contact
        </Tabs.Tab>
        <Tabs.Tab value='TAM_graph' ml='auto'>
          TAM Graph
        </Tabs.Tab>
        <Tabs.Tab value='overviewV2'>
          <IconBeta size='0.8rem' style={{ marginRight: '8px' }} />
          Overview (Beta)
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value='overview'>
        <UploadOverview />
      </Tabs.Panel>
      <Tabs.Panel value='scrapping_report'>
        <ScrappingReport />
      </Tabs.Panel>
      <Tabs.Panel value='global_contacts'>
        <GlobalContacts />
      </Tabs.Panel>
      <Tabs.Panel value='do_not_contact'>
        <DoNotContactList />
      </Tabs.Panel>
      <Tabs.Panel value='TAM_graph' className='h-0 grow'>
        <TAMGraph />
      </Tabs.Panel>
      <Tabs.Panel value='overviewV2'>
        <UploadOverviewV2 />
      </Tabs.Panel>
    </Tabs>
  )
}

export default ContactOverview
