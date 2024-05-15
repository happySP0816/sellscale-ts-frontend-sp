import { cleanJsonString } from '@utils/general';
import { completionStream } from '@utils/sockets/completionStream';
import { useEffect, useState } from 'react';
import { socket } from '../../App';
import { userDataState } from '@atoms/userAtoms';
import { useRecoilValue } from 'recoil';
import { Box, Group, Loader, ScrollArea, Text, useMantineTheme } from '@mantine/core';
import { TypeAnimation } from 'react-type-animation';
import { useDebouncedState } from '@mantine/hooks';
import useRefresh from '@common/library/use-refresh';

function removeFromEnd(str: string, toRemove: string) {
  if (str.endsWith(toRemove)) {
    return str.slice(0, str.length - toRemove.length);
  }
  return str;
}

/**
 * Displays a loading screen with a stream of messages
 * @param event - The socket event to listen to
 * @param roomId - The room to join (optional)
 * @param label - The label to display (optional)
 */
export default function LoadingStream(props: {
  event: string;
  roomId?: string;
  label?: string;
  h?: string;
}) {
  const theme = useMantineTheme();
  const userData = useRecoilValue(userDataState);

  const color = theme.colors.gray[8];

  const [preTotal, setPretotal] = useDebouncedState('', 100);
  const [delta, setDelta] = useState('');
  const [display, refreshDisplay] = useRefresh();

  useEffect(() => {
    if (!preTotal) return;
    refreshDisplay();
  }, [preTotal]);

  useEffect(() => {
    completionStream(props.event, (total, delta) => {
      setPretotal(cleanJsonString(removeFromEnd(total, delta)).trimStart());
      setDelta(cleanJsonString(delta));
    });
  }, []);

  useEffect(() => {
    if (!props.roomId) return;
    // Join the room in which the messages will be sent
    if (socket) {
      socket.emit('join-room', {
        sdr_id: userData.id,
        payload: { room_id: props.roomId },
      });
    }
  }, [props.roomId]);

  return (
    <Box
      px='sm'
      pt='sm'
      pb='sm'
      style={{
        border: '1px solid ' + theme.colors.dark[3],
        borderRadius: theme.radius.md,
        position: 'relative',
      }}
    >
      <Group
        spacing={8}
        noWrap
        style={{
          position: 'absolute',
          top: -17,
          backgroundColor: theme.colors.gray[0],
        }}
        px={5}
      >
        <Text fz='xl' fw={300}>
          {props.label ?? 'Loading'}
        </Text>
        <Loader color='blue' size='sm' />
      </Group>
      <ScrollArea h={props.h}>
        {display ? (
          <Text>
            <Text style={{ whiteSpace: 'pre-line', color: color }} span>
              {preTotal}
            </Text>
            {delta.length > 0 ? ' ' : ''}
            <TypeAnimation
              sequence={[delta]}
              wrapper='span'
              speed={50}
              style={{ fontSize: '1em', display: 'inline-block', color: color }}
            />
          </Text>
        ) : (
          <Text style={{ whiteSpace: 'pre-line', color: color }}>{preTotal}</Text>
        )}
      </ScrollArea>
    </Box>
  );
}
