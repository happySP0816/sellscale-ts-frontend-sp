import { userTokenState } from '@atoms/userAtoms';
import { API_URL } from '@constants/data';
import { Button, Flex, Text } from '@mantine/core';
import { ContextModalProps, closeAllModals } from '@mantine/modals';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';

interface DeleteSegment extends Record<string, unknown> {
  showLoader: boolean;
  segmentId: string;
}

export default function ClearSegmentModal({ innerProps }: ContextModalProps<DeleteSegment>) {
  const userToken = useRecoilValue(userTokenState);
  const [loading, setLoading] = useState(false);

  const clearSegmentProspecst = async (showLoader: boolean, segmentId: string) => {
    if (showLoader) {
      setLoading(true);
    }
    fetch(`${API_URL}/segment/wipe_segment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        segment_id: segmentId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {})
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <Text color='gray' fw={500} size={'sm'} sx={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
        Are you sure you want to clear <span style={{ fontWeight: 700 }}>{'115 prospects'}</span>from this segment?
      </Text>
      <Flex gap={'md'} mt={'lg'}>
        <Button fullWidth size='md' radius={'md'} variant='outline' color='gray' onClick={() => closeAllModals()}>
          Cancel
        </Button>
        <Button
          fullWidth
          size='md'
          color='red'
          radius={'md'}
          onClick={() => {
            clearSegmentProspecst(innerProps.showLoader, innerProps.segmentId);
          }}
        >
          Clear Segment
        </Button>
      </Flex>
    </>
  );
}
