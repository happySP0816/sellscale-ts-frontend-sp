import { userDataState, userTokenState } from "@atoms/userAtoms";
import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Input,
  Title,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { getAnalytics } from "@utils/requests/getAnalytics";
import { useRecoilValue } from "recoil";
import { useEffect, useMemo, useState } from "react";

import { IconBrandLinkedin, IconMail, IconSearch } from '@tabler/icons';
import { CampaignPersona, PersonCampaignCard } from '@common/campaigns/PersonaCampaigns';

export type Status = "Complete" | "Setup" | "Active";
type PropsType = {
  campaigns: CampaignPersona[];
}
const AllCampaign = (props: PropsType) => {
  const userData = useRecoilValue(userDataState);


  const [input, setInput] = useState("");
  const [status, setStatus] = useState("All");

  const [activeStatusesShow, setActiveStatusesShow] = useState([true]);
  
  const filteredCampaigns = props.campaigns
    .sort((a: CampaignPersona, b: CampaignPersona): any => {
      if (!a.active && !b.active) {
        return a.total_sent - b.total_sent
      }
      if (!a.active) {
        return 1
      }
      if (!b.active) {
        return -1
      }
      if (a.active && b.active) {
        return -(a.total_sent - b.total_sent)
      }
    })
    .filter((a: CampaignPersona) => {
      return a.name.toLowerCase().includes(input.toLowerCase())
    })
    .filter((a: CampaignPersona) => {
      return activeStatusesShow.includes(a.active)
    })
    .filter((a: CampaignPersona) => {
      if (status === 'All') {
        return true;
      } else if (status === 'Active' && a.active && a.total_sent > 0) {
        return a.active;
      } else if (status === 'Complete' && !a.active && a.total_sent > 0) {
        return true
      } else if (status === 'Setup' && a.total_sent === 0 && !a.active) {
        return true;
      }
      return false;
    })

  return (
    <>
      <Divider />

      <Box>
        <Flex justify={"space-between"} align={"center"} mt='md'>
          <Title color="gray.6" order={3}>
            {userData?.client.company}'s' Campaigns
          </Title>

          <Flex gap={"sm"} wrap={"wrap"} align={"center"} mb='md'>
            <Button
              variant={status === "All" ? "filled" : "light"}
              color="dark"
              size='sm'
              onClick={() => setStatus("All")}
            >
              All
              <Badge
                color="dark"
                variant={status === "All" ? "light" : "filled"}
                ml={"xs"}
              >
                {props.campaigns.length}
              </Badge>
            </Button>
            <Button
              variant={status === "Active" ? "filled" : "light"}
              color="blue"
              size='sm'
              onClick={() => setStatus("Active")}
            >
              Active
              <Badge
                color="blue"
                ml={"xs"}
              >
                {props.campaigns.filter((r) => r.active && r.total_sent > 0).length}
              </Badge>
            </Button>
            <Button
              variant={status === "Setup" ? "filled" : "light"}
              color="yellow"
              size='sm'
              onClick={() => setStatus("Setup")}
            >
              Setup
              <Badge
                color="yellow"
                ml={"xs"}
              >
                {props.campaigns.filter((r) => r.total_sent === 0 && !r.active).length}
              </Badge>
            </Button>
            <Button
              variant={status === "Complete" ? "filled" : "light"}
              color="green"
              size='sm'
              onClick={() => setStatus("Complete")}
            >
              Completed
              <Badge
                color="green"
                ml={"xs"}
              >
                {props.campaigns.filter((r) => !r.active && r.total_sent > 0).length}
              </Badge>
            </Button>

            <Input 
              onChange={(e) => setInput(e.target.value)} value={input} 
              placeholder={"Search"}
              icon={<IconSearch size={20} />}
            />
          </Flex>
        </Flex>

        {
          filteredCampaigns
            .map((persona, index) => (
              <PersonCampaignCard
                key={index}
                persona={persona}
                viewMode={'node-view'}
                onPersonaActiveStatusUpdate={async (id: number, active: boolean) => {
                }}
              />
            ))
        }
        <Box w='100%' sx={{textAlign: 'center'}}>
          {
            props.campaigns.filter((persona) => !persona.active).length > 0 && (
              <Button
                color='gray'
                variant='outline'
                size='xs'
                w='300px'
                ml='auto'
                mr='auto'
                sx={{borderRadius: '0.5rem' }}
                onClick={() => {
                  if (activeStatusesShow.length == 2) {
                    setActiveStatusesShow([true])
                  } else {
                    setActiveStatusesShow([true, false])
                  }
                }}
                mt='md'
                mb='md'
              >
                Show {activeStatusesShow.length === 0 ? 'All' : 'Active'} Campaigns
              </Button>
            )
          }
        </Box>
      </Box>
    </>
  );
};

export default AllCampaign;
