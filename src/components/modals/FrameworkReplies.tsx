import {
  Text,
  Paper,
  useMantineTheme,
  ScrollArea,
  Avatar,
  Box,
  Flex
} from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';

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
      pos={'relative'}
      bg={theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white}
    >
      {/* <LoadingOverlay visible={isFetching} overlayBlur={2} /> */}
      <ScrollArea mih={200}>
        <Text
          className='text-gray-500 text-xs'>
          Here is a couple examples where this framework was used in the past
        </Text>
        {data?.map((element: any, index: number) => (
          <Paper
            withBorder
            key={index}
            my={10}
            p={10}
            pos={'relative'}
            bg={theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0]}
          >
            <Box>
              <Flex justify={'space-between'}>
                <Flex align={'center'} className='gap-2.5'>
                  <Box>
                    <Avatar
                      size="md"
                      radius="xl"
                      src={element.img_url}
                    />
                  </Box>
                  <Text>
                    {element.full_name}
                  </Text>
                </Flex>
                <Text>
                  {element.created_at}
                </Text>
              </Flex>
              <Text
                className='mt-5 border border-black p-1'>
                {element.message}
              </Text>
            </Box>
          </Paper>
        ))}
      </ScrollArea>
    </Paper>
  );
}
