import { userTokenState } from '@atoms/userAtoms';
import { API_URL } from '@constants/data';
import { Box, Button, Center, Stack, Text } from '@mantine/core';
import { set } from 'lodash';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

export default function SlackAuthPage() {
  const userToken = useRecoilValue(userTokenState);
  const [searchParams] = useSearchParams();
  const [complete, setComplete] = useState(false);

  const handleAuthorize = async () => {
    const slackUserId = searchParams.get('user_id');

    const response = await fetch(`${API_URL}/company/authorize-slack-user`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slack_user_id: slackUserId,
      }),
    });

    setComplete(true);
  };

  return (
    <Box>
      {complete ? (
        <Center h={400}>
          <Box>
            <Text>Complete, you may close this tab and return back to Slack.</Text>
          </Box>
        </Center>
      ) : (
        <Center h={400}>
          <Stack>
            <Text>Authorize Slack user to the logged in SDR.</Text>
            <Button onClick={handleAuthorize}>Authorize</Button>
          </Stack>
        </Center>
      )}
    </Box>
  );
}
