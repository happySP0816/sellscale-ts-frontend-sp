import { Box, Button, Flex, Tabs, Text } from "@mantine/core";
import { useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import {
  IconChartArcs,
  IconList,
  IconMap,
  IconTarget,
  IconUser,
  IconWallpaper,
} from "@tabler/icons";
import GlobalContacts from "./GlobalContacts";
import DoNotContactList from "@common/settings/DoNotContactList";
import UploadOverviewV2 from "./UploadOverviewV2";
import TAMGraphV2 from "./TAMGraphV2";
import Territories from "./Territories";
import OngoingScrapes from "./OngoingScrapes";
import ProspectUploadHistory from "@common/settings/History/ProspectUploadHistory";
import Personas from "./Personas";

const ContactOverview = () => {
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);

  return (
    <Flex direction="column" py={"md"} px={"xl"}>
      <Text fw={600} size={"30px"}>
        Contacts
      </Text>
      <Tabs defaultValue="history" className="min-h-full flex flex-col">
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
          {/* <Tabs.Tab value='prospect_scoring'>
          <IconTarget size='0.8rem' style={{ marginRight: '8px', marginTop: '4px' }} />
          Prospect Scoring
        </Tabs.Tab> */}

          <Tabs.Tab value="history">
            <IconChartArcs
              size="0.8rem"
              style={{ marginRight: "8px", marginTop: "4px" }}
            />
            History
          </Tabs.Tab>
          <Tabs.Tab value="segments">
            <IconChartArcs
              size="0.8rem"
              style={{ marginRight: "8px", marginTop: "4px" }}
            />
            Segments
          </Tabs.Tab>
          {/* <Tabs.Tab value="global_contacts">
            <IconList
              size="0.8rem"
              style={{ marginRight: "8px", marginTop: "4px" }}
            />
            Global Contacts
          </Tabs.Tab> */}
          {/* <Tabs.Tab value="do_not_contact">
            <IconTarget
              size="0.8rem"
              style={{ marginRight: "8px", marginTop: "4px" }}
            />
            Do Not Contact
          </Tabs.Tab> */}
          <Tabs.Tab value="territories">
            <IconMap
              size="0.8rem"
              style={{ marginRight: "8px", marginTop: "4px" }}
            />
            Territories
          </Tabs.Tab>
          <Tabs.Tab value="ongoing_scrapes">
            <IconWallpaper
              size="0.8rem"
              style={{ marginRight: "8px", marginTop: "4px" }}
            />
            Ongoing Scrapes
          </Tabs.Tab>

          <Tabs.Tab value="personas">
            <IconUser
              size="0.8rem"
              style={{ marginRight: "8px", marginTop: "4px" }}
            />
            Personas
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
        {/* <Tabs.Panel value="global_contacts">
          <GlobalContacts />
        </Tabs.Panel> */}

        <Tabs.Panel value="personas">
          <Personas />
        </Tabs.Panel>

        <Tabs.Panel
          value="territories"
          pt="xs"
          style={{ position: "relative" }}
        >
          <Territories />
        </Tabs.Panel>

        <Tabs.Panel
          value="ongoing_scrapes"
          pt="xs"
          style={{ position: "relative" }}
        >
          <OngoingScrapes />
        </Tabs.Panel>

        {/* <Tabs.Panel value='prospect_scoring'>
          <ICPFilters />
      </Tabs.Panel> */}

        <Tabs.Panel value="history">
          <ProspectUploadHistory />
        </Tabs.Panel>

        {/* <Tabs.Panel value="do_not_contact">
          <DoNotContactList />
        </Tabs.Panel> */}
        {/* <Tabs.Panel value='TAM_graph' className='h-0 grow'>
        <TAMGraph />
      </Tabs.Panel> */}
        <Tabs.Panel value="upload_overview">
          <UploadOverviewV2 />
        </Tabs.Panel>
        <Tabs.Panel value="contact_overview" className="h-0 grow">
          <TAMGraphV2 />
        </Tabs.Panel>

        <Tabs.Panel value="segments" className="h-0 grow">
          <Box pl="md" pr="md" mt="xs" pb="4px" w="100%" display="flex">
            <Button
              ml="auto"
              onClick={() =>
                (window.location.href =
                  "/contacts/find?campaign_id=" +
                  userData?.unassigned_persona_id)
              }
            >
              Add Contacts
            </Button>
          </Box>
          <iframe
            src={
              "https://sellscale.retool.com/embedded/public/93860ed4-1e1f-442a-a00e-c4ea46a2865b#authToken=" +
              userToken
            }
            style={{
              width: "100%",
              height: window.innerHeight + 300,
              border: "none",
              borderRadius: "8px",
            }}
          />
        </Tabs.Panel>
      </Tabs>
    </Flex>
  );
};

export default ContactOverview;
