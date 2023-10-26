import { userDataState, userTokenState } from "@atoms/userAtoms";
import { Stack, Group, Button, useMantineTheme, Paper, Avatar, Text, Box, Center, Loader, Badge, TextInput, ActionIcon } from "@mantine/core";
import { IconThumbUp, IconThumbDown, IconArrowUpRight, IconSend } from "@tabler/icons";
import { proxyURL, valueToColor, nameToInitials, formatToLabel } from "@utils/general";
import _ from "lodash";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import Logo from '@assets/images/assistant.svg';
import { updateICPFilters } from "@utils/requests/icpScoring";
import { currentProjectState } from "@atoms/personaAtoms";

export type ConvoMessage = {
  isLoading?: boolean;
  isYou?: boolean;
  message?: string;
  requirements?: any;
  foundContacts?: number;
}

export function displayContactsFound(amount: number) {
  if(amount > 100000){
    return '100,000+';
  } else {
    return amount.toLocaleString();
  }
}

export default function ChatConvo(props: { changeView: () => void; convoMessages: ConvoMessage[] }) {

  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);

  return (
    <Stack>
      {props.convoMessages.map((message, index) => (
        <Box key={index}>
          {message.isLoading && <ChatBox loading />}
          {message.message && (
            <ChatBox you={message.isYou}>
              <Text fz='sm'>{message.message}</Text>
            </ChatBox>
          )}
          {message.requirements && (
            <RequirementsChatBox
              filters={message.requirements}
              onApply={async (filter) => {
                const response = await updateICPFilters(userToken, currentProject!.id, filter);
                if (response.status === 'success') {
                  props.changeView();
                }
              }}
            />
          )}
          {message.foundContacts !== undefined && (
            <ChatBox>
              <Group position='apart'>
                <Text fz='sm'>
                  Success! I ran your search and found{' '}
                  {displayContactsFound(message.foundContacts)} contacts.
                </Text>
                <Button radius='lg' variant='subtle' onClick={props.changeView}>
                  View Search Results
                </Button>
              </Group>
            </ChatBox>
          )}
        </Box>
      ))}
    </Stack>
  );
}



function ChatBox(props: { children?: React.ReactNode; you?: boolean; loading?: boolean }) {
  const userData = useRecoilValue(userDataState);
  const theme = useMantineTheme();

  return (
    <Paper shadow='xs' p='md' radius='lg' withBorder={props.you}>
      <Group>
        {props.you ? (
          <Avatar
            src={proxyURL(userData?.img_url)}
            alt={`${userData?.sdr_name}'s Profile Picture`}
            color={valueToColor(theme, userData?.sdr_name)}
            radius='xl'
          >
            {nameToInitials(userData?.sdr_name)}
          </Avatar>
        ) : (
          <Avatar radius='xl' src={Logo} alt='SellScale Assistant' />
        )}
        <Box sx={{ flex: 1 }}>
          {props.loading ? (
            <Center>
              <Loader variant='dots' size='lg' color='gray' />
            </Center>
          ) : (
            <>{props.children}</>
          )}
        </Box>
      </Group>
    </Paper>
  );
}

type SearchFilter = {
  type: string;
  include?: string[];
  exclude?: string[];
  range?: string;
};

function RequirementsChatBox(props: { filters: any, onApply: (filters: any) => void }) {
  const theme = useMantineTheme();

  useEffect(() => {
    setSearchFilters([
      {
        type: 'title',
        include: convertArray(props.filters.included_individual_title_keywords),
        exclude: convertArray(props.filters.excluded_individual_title_keywords),
      },
      {
        type: 'skills',
        include: convertArray(props.filters.included_individual_skills_keywords),
        exclude: convertArray(props.filters.excluded_individual_skills_keywords),
      },
      {
        type: 'description',
        include: convertArray(props.filters.included_individual_generalized_keywords),
        exclude: convertArray(props.filters.excluded_individual_generalized_keywords),
      },
      {
        type: 'location',
        include: convertArray(props.filters.included_individual_locations_keywords),
        exclude: convertArray(props.filters.excluded_individual_locations_keywords),
      },
      {
        type: 'industry',
        include: convertArray(props.filters.included_individual_industry_keywords),
        exclude: convertArray(props.filters.excluded_individual_industry_keywords),
      },
      {
        type: 'years of experience',
        range:
          props.filters.individual_years_of_experience_start &&
          props.filters.individual_years_of_experience_end &&
          `${props.filters.individual_years_of_experience_start} - ${props.filters.individual_years_of_experience_end}`,
      },
      {
        type: 'company description',
        include: convertArray(props.filters.included_company_generalized_keywords),
        exclude: convertArray(props.filters.excluded_company_generalized_keywords),
      },
      {
        type: 'company location',
        include: convertArray(props.filters.included_company_locations_keywords),
        exclude: convertArray(props.filters.excluded_company_locations_keywords),
      },
      {
        type: 'company industry',
        include: convertArray(props.filters.included_company_industries_keywords),
        exclude: convertArray(props.filters.excluded_company_industries_keywords),
      },
      {
        type: 'company size',
        range:
          props.filters.company_size_start &&
          props.filters.company_size_end &&
          `${props.filters.company_size_start} - ${props.filters.company_size_end}`,
      },
    ]);
  }, [props.filters]);

  const convertArray = (array: any) => {
    if (!array) {
      return [];
    }
    if (
      array.length === 1 &&
      (array[0]?.toLowerCase() === 'none' || !array[0])
    ) {
      return [];
    }
    return array.map((item: any) => item.replace(/"/g, ''));
  }

  const [searchFilters, setSearchFilters] = useState<SearchFilter[]>([]);

  return (
    <ChatBox>
      <Stack sx={{ position: 'relative' }}>
        <Button.Group
          sx={{
            position: 'absolute',
            top: -10,
            right: -10,
          }}
        >
          <Button size='xs' radius='lg' variant='light' color='gray' pl={10} pr={5}>
            <IconThumbUp size='1.0rem' />
          </Button>
          <Button size='xs' radius='lg' variant='light' color='gray' pl={5} pr={10}>
            <IconThumbDown size='1.0rem' />
          </Button>
        </Button.Group>
        <Stack spacing={5}>
          <Text fw={600} fz='sm'>
            Updated Filters
          </Text>
          <Paper p='md' radius='lg' withBorder>
            <Stack>
              {searchFilters
                .filter(
                  (filter) =>
                    (filter.include?.length ?? 0) > 0 ||
                    (filter.exclude?.length ?? 0) > 0 ||
                    filter.range
                )
                .map((filter, index) => (
                  <Group key={index}>
                    <Box w={100}>
                      <Text fz='sm' ta='right'>
                        {_.startCase(filter.type)}
                      </Text>
                    </Box>
                    <Group spacing={5}>
                      {filter.include &&
                        filter.include.map((value, index) => (
                          <Badge
                            key={index}
                            color={'blue'} // valueToColor(theme, formatToLabel(value))
                            variant='light'
                            size='sm'
                            styles={{ root: { textTransform: 'initial' } }}
                          >
                            {formatToLabel(value)}
                          </Badge>
                        ))}
                      {filter.exclude &&
                        filter.exclude.map((value, index) => (
                          <Badge
                            key={index}
                            color={'red'}
                            variant='light'
                            size='sm'
                            styles={{ root: { textTransform: 'initial' } }}
                          >
                            {formatToLabel(value)}
                          </Badge>
                        ))}
                      {filter.range && (
                        <Badge
                          color={'blue'}
                          variant='light'
                          size='sm'
                          styles={{ root: { textTransform: 'initial' } }}
                        >
                          {filter.range}
                        </Badge>
                      )}
                    </Group>
                  </Group>
                ))}
            </Stack>
          </Paper>
          <Box>
            <Button
              radius='lg'
              size='xs'
              compact
              rightIcon={<IconArrowUpRight size='1rem' />}
              styles={{
                rightIcon: {
                  marginLeft: 5,
                },
              }}
              onClick={() => props.onApply(props.filters)}
            >
              Apply
            </Button>
          </Box>
        </Stack>
      </Stack>
    </ChatBox>
  );
}
