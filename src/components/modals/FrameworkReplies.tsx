import { userTokenState } from '@atoms/userAtoms';
import {
  Text,
  Paper,
  useMantineTheme,
  Divider,
  ScrollArea,
  LoadingOverlay,
  Badge,
  Group,
  Avatar,
  Flex,
  Button,
} from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { useQuery } from '@tanstack/react-query';
import { convertDateToLocalTime, nameToInitials, valueToColor } from '@utils/general';
import { getEmailMessages } from '@utils/requests/getEmails';
import DOMPurify from 'isomorphic-dompurify';
import ReactMarkdown from 'react-markdown';
import { useRecoilValue } from 'recoil';
import { ProspectEmail } from 'src';

export default function FrameworkReplies({
  innerProps,
}: ContextModalProps<{ prospectId: number; threadId: string }>) {
  const theme = useMantineTheme();

  /* fake data */
  const data = [
    {
      full_name: "Liz Rivera, MSEd",
      img_url: "https://media.licdn.com/dms/image/D5603AQHlnIz2kuxLZQ/profile-displayphoto-shrink_800_800/0/1697738506774?e=1707955200&v=beta&t=PigxEnbwE2Sn1chrx_Afw_q0MvCeMhPjtVpbH1I1Tpw",
      message: "Thanks for accepting my invite, Liz. Given your experience with managing My Wellness Check documents and coordinating clinical programs at Sylvester Comprehensive Cancer Center, I believe our mission at Simple HealthKit to deliver scalable and affordable testing programs could align well with your work. Would you be free for a 15-minute chat next week to discuss this further?",
      created_at: "Jan 1st, 2023"
    },
    {
      full_name: "Liz Rivera, MSEd",
      img_url: "https://media.licdn.com/dms/image/D4E03AQGLYlbY-sTEHw/profile-displayphoto-shrink_400_400/0/1676396253631?e=1703721600&v=beta&t=bfpW2ackeOYLoc5KD3eBmrkozvX0YDkBnljFYsdn3xU",
      message: "Thanks for accepting my invite, Liz. Given your experience with managing My Wellness Check documents and coordinating clinical programs at Sylvester Comprehensive Cancer Center, I believe our mission at Simple HealthKit to deliver scalable and affordable testing programs could align well with your work. Would you be free for a 15-minute chat next week to discuss this further?",
      created_at: "Jan 1st, 2023"
    },
    {
      full_name: "Liz Rivera, MSEd",
      img_url: "https://media.licdn.com/dms/image/D4E03AQGLYlbY-sTEHw/profile-displayphoto-shrink_400_400/0/1676396253631?e=1703721600&v=beta&t=bfpW2ackeOYLoc5KD3eBmrkozvX0YDkBnljFYsdn3xU",
      message: "Thanks for accepting my invite, Liz. Given your experience with managing My Wellness Check documents and coordinating clinical programs at Sylvester Comprehensive Cancer Center, I believe our mission at Simple HealthKit to deliver scalable and affordable testing programs could align well with your work. Would you be free for a 15-minute chat next week to discuss this further?",
      created_at: "Jan 1st, 2023"
    },
    {
      full_name: "Liz Rivera, MSEd",
      img_url: "https://media.licdn.com/dms/image/D4E03AQGLYlbY-sTEHw/profile-displayphoto-shrink_400_400/0/1676396253631?e=1703721600&v=beta&t=bfpW2ackeOYLoc5KD3eBmrkozvX0YDkBnljFYsdn3xU",
      message: "Thanks for accepting my invite, Liz. Given your experience with managing My Wellness Check documents and coordinating clinical programs at Sylvester Comprehensive Cancer Center, I believe our mission at Simple HealthKit to deliver scalable and affordable testing programs could align well with your work. Would you be free for a 15-minute chat next week to discuss this further?",
      created_at: "Jan 1st, 2023"
    },
    {
      full_name: "Liz Rivera, MSEd",
      img_url: "https://media.licdn.com/dms/image/D4E03AQGLYlbY-sTEHw/profile-displayphoto-shrink_400_400/0/1676396253631?e=1703721600&v=beta&t=bfpW2ackeOYLoc5KD3eBmrkozvX0YDkBnljFYsdn3xU",
      message: "Thanks for accepting my invite, Liz. Given your experience with managing My Wellness Check documents and coordinating clinical programs at Sylvester Comprehensive Cancer Center, I believe our mission at Simple HealthKit to deliver scalable and affordable testing programs could align well with your work. Would you be free for a 15-minute chat next week to discuss this further?",
      created_at: "Jan 1st, 2023"
    },
    {
      full_name: "Liz Rivera, MSEd",
      img_url: "https://media.licdn.com/dms/image/D4E03AQGLYlbY-sTEHw/profile-displayphoto-shrink_400_400/0/1676396253631?e=1703721600&v=beta&t=bfpW2ackeOYLoc5KD3eBmrkozvX0YDkBnljFYsdn3xU",
      message: "Thanks for accepting my invite, Liz. Given your experience with managing My Wellness Check documents and coordinating clinical programs at Sylvester Comprehensive Cancer Center, I believe our mission at Simple HealthKit to deliver scalable and affordable testing programs could align well with your work. Would you be free for a 15-minute chat next week to discuss this further?",
      created_at: "Jan 1st, 2023"
    },
    {
      full_name: "Liz Rivera, MSEd",
      img_url: "https://media.licdn.com/dms/image/D4E03AQGLYlbY-sTEHw/profile-displayphoto-shrink_400_400/0/1676396253631?e=1703721600&v=beta&t=bfpW2ackeOYLoc5KD3eBmrkozvX0YDkBnljFYsdn3xU",
      message: "Thanks for accepting my invite, Liz. Given your experience with managing My Wellness Check documents and coordinating clinical programs at Sylvester Comprehensive Cancer Center, I believe our mission at Simple HealthKit to deliver scalable and affordable testing programs could align well with your work. Would you be free for a 15-minute chat next week to discuss this further?",
      created_at: "Jan 1st, 2023"
    },
    {
      full_name: "Liz Rivera, MSEd",
      img_url: "https://media.licdn.com/dms/image/D4E03AQGLYlbY-sTEHw/profile-displayphoto-shrink_400_400/0/1676396253631?e=1703721600&v=beta&t=bfpW2ackeOYLoc5KD3eBmrkozvX0YDkBnljFYsdn3xU",
      message: "Thanks for accepting my invite, Liz. Given your experience with managing My Wellness Check documents and coordinating clinical programs at Sylvester Comprehensive Cancer Center, I believe our mission at Simple HealthKit to deliver scalable and affordable testing programs could align well with your work. Would you be free for a 15-minute chat next week to discuss this further?",
      created_at: "Jan 1st, 2023"
    }
  ]
  return (
    <Paper
      p={0}
      style={{
        position: 'relative',
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
      }}
    >
      {/* <LoadingOverlay visible={isFetching} overlayBlur={2} /> */}
      <ScrollArea mih={200}>
        <Text style={{
            color: 'grey',
            fontSize: '12px'
        }}>
          Here is a couple examples where this framework was used in the past
        </Text>
        {data?.map((element: any, index: number) => (
          <Paper
            withBorder
            key={index}
            my={10}
            p={10}
            style={{
              position: 'relative',
              backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
            }}
          >
            <div>
              <div style={{
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center'
                }}>
                  <div>
                    <Avatar
                      size="md"
                      radius="xl"
                      src={element.img_url}
                    />
                  </div>
                  <div>
                    {element.full_name}
                  </div>
                </div>
                <div>
                  {element.created_at}
                </div>
              </div>
              <div style={{
                marginTop: '20px',
                border: '1px',
                borderColor: 'black',
                borderStyle: 'solid',
                padding: '4px'
              }}>
                  {element.message}
              </div>
            </div>
          </Paper>
        ))}
      </ScrollArea>
    </Paper>
  );
}
