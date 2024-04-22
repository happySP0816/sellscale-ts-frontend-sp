import { userTokenState } from '@atoms/userAtoms';
import { API_URL } from '@constants/data';
import { Button, Flex, Text } from '@mantine/core';
import { ContextModalProps, closeAllModals } from '@mantine/modals';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';

interface DeleteSegment extends Record<string, unknown> {
  showLoader: boolean;
  segmentId: string;
  getAllSegments: (showLoading: boolean) => void;
  num_prospected: number;
}

export default function ClearSegmentModal({ innerProps }: ContextModalProps<DeleteSegment>) {
  const userToken = useRecoilValue(userTokenState);
  const [loading, setLoading] = useState(false);

  const clearSegment = () => {
    setLoading(true);
    innerProps.getAllSegments(true);
    // setLoading(false);
    closeAllModals();
  };

  return (
    <>
      <Text color='gray' fw={500} size={'sm'} sx={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
        Are you sure you want to clear <span style={{ fontWeight: 700 }}>{innerProps.num_prospected} prospects</span>from this segment?
      </Text>
      <Flex gap={'md'} mt={'lg'}>
        <Button fullWidth size='md' radius={'md'} variant='outline' color='gray' onClick={() => closeAllModals()}>
          Cancel
        </Button>
        <Button
          fullWidth
          size='md'
          color='red'
          loading={loading}
          radius={'md'}
          onClick={() => {
            // clearSegmentProspecst(innerProps.showLoader, innerProps.segmentId);
            clearSegment();
          }}
        >
          Clear Segment
        </Button>
      </Flex>
    </>
  );
}
