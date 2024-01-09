import { Box, Button, Tabs, Tooltip } from '@mantine/core';
import { PulseWrapper } from './PulseWrapper';
import ICPFilters from './ICPFilter/ICPFilters';
import { currentProjectState } from '@atoms/personaAtoms';
import { getCurrentPersonaId, getFreshCurrentProject } from '@auth/core';
import { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { PersonaOverview } from 'src';
import { getPersonasOverview } from '@utils/requests/getPersonas';
import { navigateToPage } from '@utils/documentChange';
import UploadOverview from './UploadOverview';
import {
  IconBeta,
  IconChartArcs,
  IconChartAreaLine,
  IconList,
  IconTable,
  IconTarget,
  IconWashMachine,
  IconWorld,
} from '@tabler/icons';
import ComingSoonCard from '@common/library/ComingSoonCard';
import GlobalContacts from './GlobalContacts';
import DoNotContactList from '@common/settings/DoNotContactList';
import PageFrame from '@common/PageFrame';
import UploadOverviewV2 from './UploadOverviewV2';
import TAMGraph from './TAMGraph';
import ScrapingReport from './ScrapingReport';
import TAMGraphV2 from './TAMGraphV2';
import PulseTabSelector from './PulseTabSelector';

const ContactOverview = () => {
  const userToken = useRecoilValue(userTokenState)
  const userData = useRecoilValue(userDataState)

  return (
    <Tabs defaultValue='prospect_scoring' className='min-h-full flex flex-col'>
      <Tabs.List>
        {/* <Tabs.Tab value='overview'>
          <IconTable size='0.8rem' style={{ marginRight: '8px', marginTop: '4px' }} />
          Upload Overview
        </Tabs.Tab> */}
        {/* <Tabs.Tab value='contact_overview'>
          <IconWorld size='0.8rem' style={{ marginRight: '8px', marginTop: '4px' }} />
          Overview
        </Tabs.Tab> */}
        {/* <Tabs.Tab value='scrapping_report'>
          <IconTable size='0.8rem' style={{ marginRight: '8px', marginTop: '4px' }} />
          Scraping Report
        </Tabs.Tab> */}
        <Tabs.Tab value='prospect_scoring'>
          <IconTarget size='0.8rem' style={{ marginRight: '8px', marginTop: '4px' }} />
          Prospect Scoring
        </Tabs.Tab>
        <Tabs.Tab value='global_contacts'>
          <IconList size='0.8rem' style={{ marginRight: '8px', marginTop: '4px' }} />
          Global Contacts
        </Tabs.Tab>
        <Tabs.Tab value='do_not_contact'>
          <IconTarget size='0.8rem' style={{ marginRight: '8px', marginTop: '4px' }} />
          Do Not Contact
        </Tabs.Tab>
        <Tabs.Tab value='segments'>
          <IconChartArcs size='0.8rem' style={{ marginRight: '8px', marginTop: '4px' }} />
          Segments
        </Tabs.Tab>
        
        {/* <Tabs.Tab value='TAM_graph' style={{ marginRight: '8px' }}>
          TAM Graph
        </Tabs.Tab> */}

        {/* <Tabs.Tab value='overviewV2'>
          <IconBeta size='0.8rem' style={{ marginRight: '8px' }} />
          Overview (Beta)
        </Tabs.Tab> */}
      </Tabs.List>

      {/* <Tabs.Panel value='overview'>
        <UploadOverview />
      </Tabs.Panel> */}
      {/* <Tabs.Panel value='scrapping_report'>
        <ScrapingReport />
      </Tabs.Panel> */}
      <Tabs.Panel value='global_contacts'>
        <GlobalContacts />
      </Tabs.Panel>
      <Tabs.Panel value='prospect_scoring'>
          <ICPFilters />
      </Tabs.Panel>
      <Tabs.Panel value='do_not_contact'>
        <DoNotContactList />
      </Tabs.Panel>
      {/* <Tabs.Panel value='TAM_graph' className='h-0 grow'>
        <TAMGraph />
      </Tabs.Panel> */}
      <Tabs.Panel value='upload_overview'>
        <UploadOverviewV2 />
      </Tabs.Panel>
      <Tabs.Panel value='contact_overview' className='h-0 grow'>
        <TAMGraphV2 />
      </Tabs.Panel>

      <Tabs.Panel value='segments' className='h-0 grow'>
        <Box pl='md' pr='md' mt='xs' pb='4px' w='100%' justifyContent='space-between' alignItems='center' display='flex'>
          <Button
            ml='auto'
            onClick={() => window.location.href = '/contacts/find?campaign_id=' + userData?.unassigned_persona_id}  
          >
            Add Contacts
          </Button>
        </Box>
        <iframe 
          src={'https://sellscale.retool.com/embedded/public/93860ed4-1e1f-442a-a00e-c4ea46a2865b#authToken=' + userToken}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: '8px',
          }}
        />
      </Tabs.Panel>
    </Tabs>
  );
};

export default ContactOverview;
