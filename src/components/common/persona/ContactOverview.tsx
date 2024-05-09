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
import SegmentV2 from "@pages/SegmentV2/SegmentV2";
import { useState } from "react";

const ContactOverview = () => {
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);

  const [tabValue, setTabValue] = useState("segments");

  return (
    <Box py={"md"} px={"xl"}>
      <Text fw={600} size={"30px"}>
        Contacts
      </Text>
      <Tabs value={tabValue} onTabChange={(e: any) => setTabValue(e)}>
        <Tabs.List>
          <Tabs.Tab value="segments">
            <IconChartArcs
              size="0.8rem"
              style={{ marginRight: "8px", marginTop: "4px" }}
            />
            Segments
          </Tabs.Tab>{" "}
          <Tabs.Tab value="history">
            <IconChartArcs
              size="0.8rem"
              style={{ marginRight: "8px", marginTop: "4px" }}
            />
            History
          </Tabs.Tab>
          {/* <Tabs.Tab value="ongoing_scrapes">
            <IconWallpaper
              size="0.8rem"
              style={{ marginRight: "8px", marginTop: "4px" }}
            />
            Ongoing Scrapes
          </Tabs.Tab> */}
        </Tabs.List>

        {/* <Tabs.Panel value="personas">
          <Personas />
        </Tabs.Panel> */}

        <Tabs.Panel value="territories" pt="xs">
          <Territories />
        </Tabs.Panel>

        {/* <Tabs.Panel value="ongoing_scrapes" pt="xs">
          <OngoingScrapes />
        </Tabs.Panel> */}

        <Tabs.Panel value="history">
          <ProspectUploadHistory />
        </Tabs.Panel>

        <Tabs.Panel value="upload_overview">
          <UploadOverviewV2 />
        </Tabs.Panel>

        <Tabs.Panel value="contact_overview">
          <TAMGraphV2 />
        </Tabs.Panel>

        <Tabs.Panel value="segments">
          <SegmentV2
            onDownloadHistoryClick={() => {
              setTabValue("history");
            }}
          />
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
};

export default ContactOverview;
