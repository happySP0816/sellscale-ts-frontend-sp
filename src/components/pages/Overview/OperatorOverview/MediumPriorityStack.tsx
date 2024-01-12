import { Stack, Text, Flex, Button, Rating } from '@mantine/core';
import Operation from './Operation/Operation';
import { Priority } from './Operation/Operation';
import MediumPriority from './Operation/MediumPriority';
import { userTokenState } from '@atoms/userAtoms';
import { useQuery } from '@tanstack/react-query';
import getDemoFeedback from '@utils/requests/getDemoFeedback';
import _ from 'lodash';
import { useRecoilValue } from 'recoil';
import { DemoFeedback, Prospect } from 'src';
import { getProspects } from '@utils/requests/getProspects';

const MediumPriorityStack = () => {
  const userToken = useRecoilValue(userTokenState);

  const { data, isFetching } = useQuery({
    queryKey: [`query-feedback-prospects`, {}],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, {}] = queryKey;

      const response = await getProspects(
        userToken,
        undefined,
        undefined,
        100,
        ['ACTIVE_CONVO_SCHEDULING'],
        'ALL',
        undefined,
        true
      );
      let results = response.status === 'success' ? (response.data as Prospect[]) : [];

      return results;
    },
    refetchOnWindowFocus: false,
  });

  return (
    <Stack>
      <Flex>
        <Text c={'yellow.6'} fw={700} fz={'lg'}>
          Medium Priority: &nbsp;
        </Text>

        <Text c={'gray.6'} fw={700} fz={'lg'}>
          Schedule Prospects
        </Text>
      </Flex>

      {(data ?? []).map((i, idx) => (
        <DemoFeedbackWrapper key={idx} prospect={i} />
      ))}
    </Stack>
  );
};

function DemoFeedbackWrapper(props: { prospect: Prospect }) {
  const userToken = useRecoilValue(userTokenState);

  const { data: demoFeedbacks } = useQuery({
    queryKey: [`query-get-prospect-demo-feedback-${props.prospect.id}`],
    queryFn: async () => {
      const response = await getDemoFeedback(userToken, props.prospect.id);
      return response.status === 'success' ? (response.data as DemoFeedback[]) : undefined;
    },
  });

  if (demoFeedbacks) {
    return null;
  }

  return (
    <Operation
      priority={Priority.Medium}
      renderLeft={
        <Flex align={'center'}>
          <Text fw={500} fz={'sm'}>
            Demo Feedback Needed&nbsp;
          </Text>
          <Text fw={500} fz={'sm'} c={'gray.6'}>
            {props.prospect.full_name}
          </Text>
        </Flex>
      }
      renderContent={<MediumPriority prospect={props.prospect} />}
      renderRight={
        <Flex align={'center'} gap={'sm'}>
          <Rating defaultValue={0} />
          <Button size='xs' variant='outline' radius={'xl'} compact>
            Add feedback
          </Button>
        </Flex>
      }
    />
  );
}

export default MediumPriorityStack;
