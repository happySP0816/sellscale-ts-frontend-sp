import { userTokenState } from '@atoms/userAtoms';
import {
  Text,
  Paper,
  useMantineTheme,
  Box,
  ScrollArea,
  LoadingOverlay,
  Avatar,
  Flex,
} from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { useQuery } from '@tanstack/react-query';
import { useRecoilValue } from 'recoil';
import { getBumpFrameworkMessages } from "@utils/requests/getBumpFrameworks";


export default function FrameworkReplies({
  innerProps,
}: ContextModalProps<{ bumpId: number }>) {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);


  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-framework-email-messages-${innerProps.bumpId}`],
    queryFn: async () => {
      const response = await getBumpFrameworkMessages(userToken, innerProps.bumpId);
      return response.status === 'success' ? response.data : [];
    },
    refetchOnWindowFocus: false,
  });


  return (
    <Paper
      p={0}
      pos={'relative'}
      bg={theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white}
    >
      <LoadingOverlay visible={isFetching} overlayBlur={2} />
      <ScrollArea mih={200}>
        <Text
          className='text-gray-500 text-xs'>
          Here is a couple examples where this framework was replied to in the past
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