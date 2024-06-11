import { userDataState, userTokenState } from '@atoms/userAtoms';
import { useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Progress,
  RingProgress,
  LoadingOverlay,
  Text,
  Tooltip,
  TextInput,
  useMantineTheme,
} from '@mantine/core';
import {
  IconArrowUp,
  IconDotsVertical,
  IconGlobe,
  IconMap,
  IconCash,
  IconCheck,
  IconPencil,
  IconBuildingBank,
  IconMessage,
  IconUsers,
} from '@tabler/icons';
import { IconBriefcase2 } from '@tabler/icons-react';
import { syncLocalStorage } from '@auth/core';
import { API_URL } from '@constants/data';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

export default function SegmentV2Overview(props: any) {
  const { data, totalProspected, totalContacted, totalInFilters, totalUniqueCompanies } = props;
  const theme = useMantineTheme();

  const userData = useRecoilValue(userDataState);

  const [editModeACV, setEditModeACV] = useState(false);
  const [editableACV, setEditableACV] = useState(userData.client.contract_size);
  //if they edited the acv after saving, we need to update the acv
  //can be null or number
  const [editedACV, setEditedACV] = useState(null as number | null);
  const [isSavingACV, setIsSavingACV] = useState(false); // State to manage loading state
  const userToken = useRecoilValue(userTokenState);

  const handleEditACVClick = () => {
    setEditModeACV(true);
  };

  const handleSaveACVClick = () => {
    const savedValue = editableACV === 0 ? 0 : Number(editableACV);
    setIsSavingACV(true); // Start loading
    fetch(`${API_URL}/client/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        contract_size: savedValue,
      }),
    })
      .then((response) => {
        setIsSavingACV(false); // Stop loading
        if (response.ok) {
          syncLocalStorage(userToken, (userData) => {
            userData.client.contract_size = savedValue;
            setEditedACV(savedValue);
            return userData;
          });
          setEditModeACV(false);
          setEditableACV((num) => savedValue); // Update the display to show the saved value
        } else {
          console.error('Failed to update contract size');
        }
      })
      .catch((error) => {
        setIsSavingACV(false); // Stop loading on error
        console.error('Error updating contract size:', error);
      });
  };
  const totalSegments =
    data.length +
    data.map((x: any) => x.sub_segments.length).reduce((acc: number, item: any) => acc + item, 0);

  return (
    <Flex align={'center'} gap={'lg'} mb={'lg'}>
      {/* TAM Value */}
      <Card pl='sm' pr='sm' pt='8px' pb='8px' radius='md' withBorder w={'40%'}>
        <Flex align={'center'} justify={'space-between'}>
          <Flex direction={'column'}>
            <Flex align={'center'}>
              <Text fw={600} color='gray.8' fz='xs'>
                <Box
                  sx={(theme) => ({
                    borderRadius: 9999,
                    display: 'inline-block',
                    marginRight: 4,
                    width: 12,
                    height: 12,
                    backgroundColor: theme.colors.blue[theme.fn.primaryShade()],
                  })}
                />
                Estimated TAM Value
              </Text>
            </Flex>
            <Flex align={'center'} gap={'xs'}>
              <Text fw={500} fz={'25px'}>
                {/* # numAccounts x acv */}$
                {(
                  totalUniqueCompanies * (editedACV || userData.client.contract_size)
                ).toLocaleString()}
              </Text>
            </Flex>
          </Flex>
          <Box
            sx={{
              textAlign: 'center',
              flexDirection: 'row',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <RingProgress
              size={90}
              sections={[
                {
                  value: Math.round((totalContacted / (totalProspected || 1)) * 100),
                  color: theme.colors.blue[6],
                },
              ]}
              label={
                <Text c='blue' fw={700} ta='center' size='sm' color='gray'>
                  {Math.round((totalContacted / (totalProspected || 1)) * 1000) / 10}%
                </Text>
              }
            />
            <Text size='10px' color='gray'>
              # Contacted / <br /># Imported
            </Text>
          </Box>
        </Flex>
      </Card>

      {/* ACV */}
      <Card sx={{ cursor: 'pointer' }} padding='lg' radius='md' withBorder w={'15%'}>
        <LoadingOverlay visible={isSavingACV} />
        <Flex align={'center'} justify={'space-between'}>
          <Flex align={'center'} gap={'sm'}>
            <IconCash color={theme.colors.green[3]} size={'1.1rem'} style={{ marginTop: '-1px' }} />
            <Text fw={500} color='gray' fz='xs'>
              ACV
            </Text>
          </Flex>
        </Flex>
        <Flex align={'center'} gap={'sm'}>
          {!editModeACV ? (
            <Text size={30} fw={500}>
              ${isNaN(parseInt(`${editableACV}`)) ? '0' : parseInt(`${editableACV}`).toLocaleString()}
            </Text>
          ) : (
            <TextInput
              value={editableACV}
              onChange={(event) => setEditableACV(Number(event.currentTarget.value))}
              type='number'
              style={{ width: '100%' }}
            />
          )}
          <Tooltip
            label={!editModeACV ? 'Edit ACV' : 'Save Changes'}
            position={'bottom'}
            openDelay={400}
          >
            <Button
              size='xs'
              compact
              color={'gray'}
              onClick={!editModeACV ? handleEditACVClick : handleSaveACVClick}
            >
              {!editModeACV ? <IconPencil size={'0.9rem'} /> : <IconCheck size={'0.9rem'} />}
            </Button>
          </Tooltip>
        </Flex>
      </Card>

      {/* Accounts */}
      <Card padding='lg' radius='md' withBorder w={'15%'}>
        <Flex align={'center'} justify={'space-between'}>
          <Flex align={'center'} gap={'sm'}>
            <IconBuildingBank
              color={theme.colors.orange[3]}
              size={'1.1rem'}
              style={{ marginTop: '-1px' }}
            />
            <Text fw={500} color='gray' fz='xs'>
              Accounts
            </Text>
          </Flex>
        </Flex>
        <Flex align={'center'} gap={'sm'}>
          <Text size={30} fw={500}>
            {totalUniqueCompanies}
          </Text>
        </Flex>
      </Card>

      {/* Number contacted */}
      <Card padding='lg' radius='md' withBorder w={'15%'}>
        <Flex align={'center'} justify={'space-between'}>
          <Flex align={'center'} gap={'sm'}>
            <IconUsers color='#228be6' size={'1.1rem'} style={{ marginTop: '-1px' }} />
            <Text fw={500} color='gray' fz='xs'>
              Contacts
            </Text>
          </Flex>
        </Flex>
        <Flex align={'center'} gap={'sm'}>
          <Text size={30} fw={500}>
            {totalProspected}
          </Text>
        </Flex>
      </Card>
      {/* Number segments */}
      <Card padding='lg' radius='md' withBorder w={'15%'}>
        <Flex align={'center'} justify={'space-between'}>
          <Flex align={'center'} gap={'sm'}>
            <IconBriefcase2 color='#d444f1' size={'1.1rem'} style={{ marginTop: '-1px' }} />
            <Text fw={500} color='gray' fz='xs'>
              Segments
            </Text>
          </Flex>
        </Flex>
        <Flex align={'center'} gap={'sm'}>
          <Text size={30} fw={500}>
            {totalSegments}
          </Text>
        </Flex>
      </Card>
    </Flex>
  );
}
