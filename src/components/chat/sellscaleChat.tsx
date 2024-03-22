import { useEffect, useRef, useState } from 'react';
import WhiteLogo from './logo.png';
import { ActionIcon, Avatar, Box, Button, Card, Flex, Image, Input, Popover, ScrollArea, Text } from '@mantine/core';
import { IconChartBar, IconMessage, IconSend, IconTargetArrow, IconX } from '@tabler/icons';
import { useRecoilValue } from 'recoil';
import { userDataState } from '@atoms/userAtoms';
import { useNavigate } from 'react-router-dom';
import { navigateToPage } from '@utils/documentChange';

interface ChatEntry {
  type: string;
  message: string;
}

export function AnimationText(props: any) {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  props.setIsAnimation(true);

  useEffect(() => {
    if (displayedText.length == props.text.length) {
      props.setIsAnimation(false);
    }

    if (index < props.text.length) {
      const timeoutId = setTimeout(() => {
        setDisplayedText((prev) => prev + props.text[index]);
        setIndex((prev) => prev + 1);
      }, 10);

      return () => clearTimeout(timeoutId);
    }
  }, [index, props.text]);

  return (
    <Text size={'xs'} sx={{ whiteSpace: 'pre-line' }}>
      {displayedText}
    </Text>
  );
}

export default function SellscaleChat() {
  const userData = useRecoilValue(userDataState);
  const [chatbot, setChatbot] = useState(false);
  const [mineChat, setMineChat] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEnterKeyPress = (event: any) => {
    if (event.key === 'Enter') {
      handleChat(index, false);
    }
  };
  const handleClick = () => {
    setChatbot(!chatbot);
  };

  if (userData.id !== 34) {
    return null;
  }
  const response = [
    {
      type: 'ai',
      message: "Hello Ishan! I'm SellScale AI. To kick things off, what kind of campaign did you want to run today?",
      response_status: true,
      go_to_url: '/campaigns',
    },
    {
      type: 'ai',
      message: `Great. Here's a couple names you can choose between, which one do you prefer?
          a. 'New York Hedge Fund Managers'
          b. 'Directors + VPs at NYC Hedge Funds'
          c. 'Hedge Fund Decision Makers'`,
      response_status: true,
      go_to_url: '/null',
    },
    {
      type: 'action',
      message: "create_campaign('Directors + VPs at NYC Hedge Funds')",
      response_status: false,
      go_to_url: '/test1',
    },
    {
      type: 'ai',
      message: `Great - the campaign has been successfully created! Here's what I'll do to create your prospect list.
          1. I am going to look for the top 30 hedge funds in New York
          2. I will then look for decision makers like directors and managers.
          3. I will then proceed to process the list and verify it's accurate.
                Give me a moment`,
      response_status: false,
      go_to_url: null,
    },
    {
      type: 'action',
      message: "search('top 30 hedge funds in New York')",
      response_status: false,
      go_to_url: '/test2',
    },
    {
      type: 'ai',
      message: `I found the top 30 Hedge Funds in New York! Here are the first few:
        - Renaissance Technologies - www.rt.com
        - Citadel - www.citadel.com
        - Elliot Management - www.elliot.io
        - Bridgewater - www.bw.com

        I'm going to look for decision makers (directors and managers) at these hedge funds now.`,
      response_status: false,
      go_to_url: '/test3',
    },
    {
      type: 'action',
      message: 'find_contacts("managing partners, directors", list_30_hedge_funds)',
      response_status: false,
      go_to_url: null,
    },
    {
      type: 'ai',
      message: `I found 1,391 directors and VPs at hedge funds in New York. Here's a sample:
          - 👥 Rebecca Jordan, Director [linkedin.com/rebeccajordan]
          - 👥 Fernance Morin, Managing Partner [linkedin.com/fernancemorin]
          - 👥 Monica Patel, Vice President [linkedin.com/monicapatel]

          How do these contacts look? Anything you'd like to adjust?`,
      response_status: true,
      go_to_url: null,
    },
    {
      type: 'ai',
      message: `On it! Sounds like you want to target vice presidents only. Let me adjust your filtering now`,
      response_status: false,
      go_to_url: null,
    },
    {
      type: 'action',
      message: 'find_contacts("vice presidents", list_30_hedge_funds)',
      response_status: false,
      go_to_url: null,
    },
    {
      type: 'ai',
      message: `I found 731 vice presidents at hedge funds in New York. I've listed a couple examples list below:
          - 👥 Monica Patel, Vice President [linkedin.com/monicapatel]
          - 👥 Stewart M. Johnson, Vice President [linkedin.com/stewartmjohnson]
          - 👥 Johnathan Smith, Vice President [linkedin.com/johnathansmith]

          By the way Ishan, I noticed that you went to Stanford in 2015. Would you like me to filter this list to only include contacts that went to Stanford University?`,
      response_status: true,
      go_to_url: '/test4',
    },
    {
      type: 'ai',
      message: `Go trees! Targetting contacts that went to your university is a great strategy. 
          I will adjust the filtering to only include contacts that went to Stanford University while looking for vice presidents at hedge funds in New York.`,
      response_status: false,
      go_to_url: null,
    },
    {
      type: 'action',
      message: 'find_contacts("vice presidents", list_30_hedge_funds, "Stanford University")',
      response_status: false,
      go_to_url: null,
    },
    {
      type: 'ai',
      message: `I found the following 27 vice presidents at hedge funds in New York who went to Stanford University. Review three below:
          - 👥 Monica Patel, Vice President [linkedin.com/monicapatel] (Stanford University)
          - 👥 Joshua P. Quin, Vice President [linkedin.com/joshuapquin] (Stanford University)
          - 👥 Colin Z. Plath, Vice President [linkedin.com/colinzplath] (Stanford University)

          How do these contacts look? Anything you'd like to adjust?`,
      response_status: true,
      go_to_url: '/test5',
    },
    {
      type: 'ai',
      message: `Great! I will now proceed to process the list and verify it's accurate`,
      response_status: false,
      go_to_url: null,
    },
    {
      type: 'action',
      message: 'score_contacts(list_27_vp_hedge_funds)',
      response_status: false,
      go_to_url: null,
    },
    {
      type: 'ai',
      message: `I've gone ahead and imported, reviewed, and scored the profiles of all 27 contacts in this campaign.
          🟩 23 Very High Fits
          🟦 4 High Fits
          🟨 0 Medium Fits
          🟧 0 Low Fits
          🟥 0 Very Low Fits

          Let's get started with writing the campaign sequence. To kick things off, let me check your asset library for any interesting assets.`,
      response_status: false,
      go_to_url: null,
    },
    {
      type: 'action',
      message: 'find_relevant_assets("hedge funds", "vice presidents")',
      response_status: false,
      go_to_url: null,
    },
    {
      type: 'ai',
      message: `I found two interesting assets in the NewtonX library that you may want to use in this campaign:
          1. Coffee chat: This is a low cost, casual offer to connect with a prospect over a coffee chat.
          [conversion: 32%; past users: Morgan P., Johnathan S.]

          2. NYC NewtonX Conference: This is a high cost, high value offer to connect with a prospect at a conference in NYC.
          [conversion: 78%; past users: Rebecca J.]

          Would you like to use any of these assets in your campaign?`,
      response_status: true,
      go_to_url: null,
    },
    {
      type: 'ai',
      message: `Are there any other assets you'd like for us to use?`,
      response_status: true,
      go_to_url: null,
    },
    {
      type: 'ai',
      message: `Inviting them to get lunch at the office is a great idea! I will create that asset and connect it to your campaign.`,
      response_status: false,
      go_to_url: null,
    },
    {
      type: 'action',
      message: 'create_asset("Lunch @ NewtonX Office", "Invite your prospect to get lunch at the NewtonX office")',
      response_status: false,
      go_to_url: null,
    },
    {
      type: 'ai',
      message: `I've created the asset and connected it to your campaign. Let's move on to the next step which is writing the copy.

          I will proceed to create a 3 step LinkedIn sequence for this campaign.`,
      response_status: false,
      go_to_url: null,
    },
    {
      type: 'action',
      message:
        'create_sequence("LinkedIn", "3-step", "hedge funds", "vice presidents", assets=["Coffee chat", "Lunch @ NewtonX Office", "NYC NewtonX Conference"])',
      response_status: false,
      go_to_url: null,
    },
    {
      type: 'ai',
      message: `I've created the sequence and connected it to your campaign. Here's a preview of three steps:

          Step 1: Coffee chat
          "Hi [First Name], fellow Stanford-alum reaching out - would love to connect over a coffee chat and learn more about your work at [Hedge Fund Name]. I've been meaning to connect with more finance leaders in the area"

          Step 2: Lunch @ NewtonX Office
          "Hi [First Name], I'm hosting a lunch at the NewtonX office next week and would love to invite you. I think you'd find the conversation with our team and other finance leaders valuable"

          Step 3: NYC NewtonX Conference
          "Hi [First Name], I'm inviting you to the NYC NewtonX conference next month. I think you'd find the conversations with other finance leaders valuable"

          How does that look, Ishan?`,
      response_status: true,
      go_to_url: null,
    },
    {
      type: 'ai',
      message: 'Great! I will now proceed to create a review card for this campaign',
      response_status: false,
      go_to_url: null,
    },
    {
      type: 'action',
      message: 'create_review_card(campaign_id)',
      response_status: false,
      go_to_url: null,
    },
    {
      type: 'ai',
      message: `The review card has been successfully created. You can verify and make any final adjustments at this link:
          https://app.sellscale.com/campaigns/8391/review

          Best of luck with your campaign, Ishan! Let me know if you need anything else.`,
      response_status: false,
      go_to_url: null,
    },
  ];
  const [index, setIndex] = useState(0);
  const [isAnimation, setIsAnimation] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
  const hasCalledHandleChat = useRef(false);
  const viewport = useRef<HTMLDivElement>(null);
  const handleChat = async (currentIndex: number, flag: boolean) => {
    if (flag) {
      const currentResponse = response[currentIndex];
      setChatHistory((chatHistory) => [...chatHistory, { type: currentResponse.type, message: currentResponse.message }]);
    } else {
      setChatHistory((chatHistory) => [...chatHistory, { type: 'user', message: mineChat }]);
      setMineChat('');
    }

    if (response[currentIndex].response_status === true) {
      if (!flag) {
        setIndex(currentIndex + 1);
        await handleChat(currentIndex + 1, true);
      }
    } else {
      setIndex(currentIndex + 1);

      const waitForPreviousChat = async (checkVariable: any, interval = 100) => {
        return new Promise<void>((resolve) => {
          const intervalId = setInterval(() => {
            if (checkVariable()) {
              clearInterval(intervalId);
              resolve();
            }
          }, interval);
        });
      };

      await waitForPreviousChat(() => isAnimation == true);

      await new Promise((resolve) => setTimeout(resolve, 4000));
      await handleChat(currentIndex + 1, true);
    }
    // if (response[currentIndex].go_to_url !== null) {
    //   console.log('qqqqqqqqqqqqqqqqqqqqqqqq');
    //   navigateToPage(navigate, response[currentIndex].go_to_url);
    // }
  };

  useEffect(() => {
    if (!hasCalledHandleChat.current && chatbot) {
      handleChat(index, true);
      hasCalledHandleChat.current = true;
    }
  }, [chatbot]);

  useEffect(() => {
    viewport.current?.scrollTo({ top: viewport.current.scrollHeight });
  }, []);

  return (
    <>
      <Popover offset={{ mainAxis: 10, crossAxis: -85 }}>
        <Popover.Target>
          <Button
            sx={{
              position: 'absolute',
              bottom: '50px',
              right: '50px',
              backgroundColor: '#d444f1',
              '&:hover': {
                backgroundColor: '#d444f1',
              },
            }}
            radius={'100%'}
            w={'fit-content'}
            h={'fit-content'}
            p={'sm'}
          >
            <img src={WhiteLogo} className='w-[26px] h-[26px]' />
          </Button>
        </Popover.Target>
        <Popover.Dropdown
          sx={{
            backgroundColor: 'transparent',
            border: 'none',
          }}
        >
          {chatbot ? (
            <>
              <Card
                shadow='sm'
                padding='lg'
                radius='lg'
                withBorder
                w={350}
                h={580}
                py={'lg'}
                mr={'35px'}
                sx={{
                  border: '1px #228be6 solid !important',
                  padding: '0px !important',
                }}
              >
                <Card.Section
                  sx={{
                    backgroundColor: '#228be6',
                    display: 'flex',
                    padding: '14px',
                    justifyContent: 'center',
                    color: 'white',
                    position: 'relative',
                    alignItems: 'center',
                    margin: '0px !important',
                  }}
                >
                  <Text
                    w={'100%'}
                    align='center'
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                    }}
                    size={'lg'}
                    fw={600}
                  >
                    <img src={WhiteLogo} className='w-[20px] h-[20px]' />
                    Sage
                  </Text>
                  <IconX
                    style={{
                      cursor: 'pointer',
                      width: 'fit-content',
                      position: 'absolute',
                      right: 18,
                    }}
                    size={'1.2rem'}
                    onClick={() => {
                      setChatbot(false);
                      setChatHistory([]);
                      setIndex(0);
                    }}
                  />
                </Card.Section>
                <Flex direction={'column'} p={'sm'} h={'100%'} gap={'lg'}>
                  <ScrollArea h={'430px'} offsetScrollbars scrollbarSize={8} scrollHideDelay={4000} viewportRef={viewport}>
                    <Flex direction={'column'} justify={'flex-start'} w={'100%'} gap={'sm'}>
                      {chatHistory?.map((chat, idx) => (
                        <div key={idx}>
                          {chat.type === 'ai' ? (
                            <Flex gap={'xs'}>
                              <Box bg={'black'} w={'fit-content'} h={'fit-content'} p={'8px'} sx={{ borderRadius: '100%' }}>
                                <Avatar size={'xs'} radius={'100%'} src={WhiteLogo} />
                              </Box>
                              <Flex direction={'column'}>
                                <Box
                                  p={'xs'}
                                  bg={'#f8f9fa'}
                                  sx={{
                                    borderRadius: '8px',
                                    borderBottomLeftRadius: '0px',
                                  }}
                                >
                                  <AnimationText text={chat?.message} setIsAnimation={setIsAnimation} />
                                </Box>
                                {/* <Text color='gray' size={'xs'}>
                                  {item?.response_date}
                                </Text> */}
                              </Flex>
                            </Flex>
                          ) : chat.type === 'user' && chat.message ? (
                            <Flex w={'100%'} justify={'end'}>
                              <Flex align={'end'} justify={'flex-end'} direction={'column'} w={'85%'}>
                                <Box
                                  p={'xs'}
                                  bg={'#228be6'}
                                  sx={{
                                    borderRadius: '8px',
                                    borderBottomRightRadius: '0px',
                                  }}
                                >
                                  <Text color='white' size={'xs'}>
                                    {chat?.message}
                                  </Text>
                                </Box>
                                {/* <Text color='gray' size={'xs'}>
                                  {123}
                                </Text> */}
                              </Flex>
                            </Flex>
                          ) : (
                            <Box
                              sx={{
                                border: '2px #f6d5fb solid',
                                borderRadius: '8px',
                                backgroundColor: '#fdf5fe',
                                wordBreak: 'break-all',
                              }}
                              p={'sm'}
                            >
                              {/* <span
                                style={{
                                  color: '#d444f1',
                                  fontWeight: 600,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  width: 'fit-content',
                                  fontSize: '13px',
                                  lineHeight: '1.4',
                                }}
                              >
                                <IconSparkles size={'0.9rem'} />
                                Finding Prospects:{' '}
                              </span> */}
                              <span
                                style={{
                                  color: '#d444f1',
                                  fontSize: '12px',
                                  lineHeight: '1.4',
                                }}
                              >
                                {/* Finding contacts who are Product Managers at companies that are mid sized (100 - 1000 employees). Specifically target companies
                                working in the Augmented Reality space. No large companies. Target Bay Area cities like San Francisco, San Jose, San Mateo, and
                                more. */}
                                {chat?.message}
                              </span>
                              <Text color='#d444f1' size={'xs'}></Text>
                            </Box>
                          )}
                        </div>
                      ))}
                    </Flex>
                  </ScrollArea>
                  <Flex w={'100%'}>
                    <Input
                      placeholder='Type here...'
                      w={'100%'}
                      size='md'
                      radius={'md'}
                      disabled={loading}
                      value={mineChat}
                      rightSection={
                        <ActionIcon variant='filled' aria-label='Settings' color='blue' radius={'md'} onClick={() => handleChat(index, false)}>
                          <IconSend style={{ width: '70%', height: '70%' }} stroke={1.5} />
                        </ActionIcon>
                      }
                      onChange={(e) => setMineChat(e.target.value)}
                      onKeyDown={handleEnterKeyPress}
                    />
                  </Flex>
                </Flex>
              </Card>
            </>
          ) : (
            <>
              <Flex direction={'column'} gap={'md'} align={'end'}>
                <Button color='orange' radius='xl' w={'fit-content'} px={'lg'} leftIcon={<IconMessage size={'1rem'} />} onClick={handleClick}>
                  Adjust Messaging
                </Button>
                <Button color='green' radius='xl' w={'fit-content'} px={'lg'} leftIcon={<IconChartBar size={'0.9rem'} />} onClick={handleClick}>
                  Understand Analytics
                </Button>
                <Button radius='xl' w={'fit-content'} px={'lg'} leftIcon={<IconTargetArrow size={'0.9rem'} />} onClick={handleClick}>
                  Create Campaign
                </Button>
              </Flex>
            </>
          )}
        </Popover.Dropdown>
      </Popover>
    </>
  );
}
