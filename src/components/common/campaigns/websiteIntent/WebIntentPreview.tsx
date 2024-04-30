import { Avatar, Box, Flex, Text } from '@mantine/core';
import { Sparklines, SparklinesCurve } from 'react-sparklines';

export default function WebIntentPreview(props: any) {
  return (
    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Sparklines data={props.line_data} height={30} width={100}>
        <SparklinesCurve color='green' />
      </Sparklines>
      <Flex sx={{ position: 'absolute', margin: 'auto' }}>
        <Avatar.Group>
          <Avatar src={props.logo_one_url} radius={'xl'} />
          <Avatar src={props.logo_two_url} radius={'xl'} />
          <Avatar src={props.logo_three_url} radius={'xl'} />
        </Avatar.Group>
      </Flex>
    </Box>
  );
}
