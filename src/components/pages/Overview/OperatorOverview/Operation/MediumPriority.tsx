import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Stack,
  Text,
  rem,
  Group,
  createStyles,
  Textarea,
  Rating,
} from '@mantine/core';
import { FaLinkedin } from '@react-icons/all-files/fa/FaLinkedin';
import { IconExternalLink, IconHomeHeart } from '@tabler/icons';
import moment from 'moment';
import { IconBriefcase, IconBuildingStore } from '@tabler/icons-react';
import { Editor } from '@tiptap/react';
import { DemoFeedback, Prospect } from 'src';
import { useState } from 'react';
import postSubmitDemoFeedback from '@utils/requests/postSubmitDemoFeedback';
import { userTokenState } from '@atoms/userAtoms';
import { useRecoilValue } from 'recoil';
import { useQuery } from '@tanstack/react-query';
import getDemoFeedback from '@utils/requests/getDemoFeedback';
const useStyles = createStyles((theme) => ({
  icon: {
    color: theme.colors.gray[6],
  },
}));
const MediumPriority = (props: { prospect: Prospect }) => {
  const { classes } = useStyles();
  const userToken = useRecoilValue(userTokenState);

  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);

  return (
    <Box>
      <Grid>
        <Grid.Col span={4}>
          <Stack h={'100%'}>
            <Flex
              p={'xs'}
              sx={(theme) => ({
                border: `1px dashed ${theme.colors.blue[theme.fn.primaryShade()]}`,
                borderRadius: rem(12),
              })}
              justify={'space-between'}
            >
              <Flex align={'center'}>
                <Avatar size={'md'} />

                <Box>
                  <Text fz={'xs'} fw={700}>
                    Demo #1 with {props.prospect.full_name}
                  </Text>
                  {props.prospect.demo_date && (
                    <Text fz={'xs'}>
                      Demo on{' '}
                      <Text component='span' c={'blue'} fw={500}>
                        {moment(new Date(props.prospect.demo_date)).format('MMMM d,yyyy')}
                      </Text>
                    </Text>
                  )}
                </Box>
              </Flex>
            </Flex>
            <Card withBorder radius={'lg'} p={'xs'}>
              <Stack spacing={'xs'}>
                <Group noWrap spacing={10} mt={3}>
                  <IconBriefcase stroke={1.5} size={18} className={classes.icon} />
                  <Text size='xs'>{props.prospect.title}</Text>
                </Group>

                <Group noWrap spacing={10} mt={5}>
                  <IconHomeHeart stroke={1.5} size={16} className={classes.icon} />
                  <Text size='xs'>{props.prospect.location}</Text>
                </Group>

                <Group noWrap spacing={10} mt={5}>
                  <IconBuildingStore stroke={1.5} size={18} className={classes.icon} />
                  <Text size='xs'>{props.prospect.company}</Text>
                </Group>
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>
        <Grid.Col span={8}>
          <Flex direction={'column'} h={'100%'}>
            <Box sx={{ flex: 1 }}>
              <Textarea
                styles={{
                  root: {
                    width: '100%',
                    height: '100%',
                  },
                  wrapper: {
                    width: '100%',
                    height: '100%',
                  },
                  input: {
                    width: '100%',
                    height: '100%',
                  },
                }}
                placeholder='Write Feedback here'
                value={feedback}
                onChange={(e) => setFeedback(e.currentTarget.value)}
              />
            </Box>
            <Flex w={'100%'} mt={'sm'} justify={'space-between'} align={'center'}>
              <Flex align={'center'} gap={'xs'}>
                <Text fw={700}>Rating:</Text>

                <Rating
                  value={rating}
                  onChange={(value) => {
                    setRating(value);
                  }}
                />
              </Flex>
              <Button
                radius={'md'}
                onClick={async () => {
                  await postSubmitDemoFeedback(
                    userToken,
                    props.prospect.id,
                    'OCCURRED',
                    `${rating}/5`,
                    feedback,
                    undefined,
                    undefined
                  );
                }}
              >
                Add Demo Feedback
              </Button>
            </Flex>
          </Flex>
        </Grid.Col>
      </Grid>
    </Box>
  );
};

export default MediumPriority;
