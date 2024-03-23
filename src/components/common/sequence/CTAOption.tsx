import {
  ActionIcon,
  Text,
  Card,
  Button,
  Tooltip,
  Switch,
  Flex,
  MantineColor,
  Badge,
  Group,
} from '@mantine/core';
import CtaAssets from '@modals/CtaAssets';
import { IconEdit, IconTrash } from '@tabler/icons';
import { deterministicMantineColor } from '@utils/requests/utils';

interface Tag {
  label: string;
  highlight?: string;
  color: MantineColor;
  hovered?: string;
  variant: 'subtle' | 'filled' | 'light';
}

export interface TabOption {
  id: number;
  label: string;
  description: string;
  checked: boolean;
  tags: Tag[];
  outlined?: boolean;

  type: string;
}

export const CTAOption: React.FC<{
  data: TabOption;
  onToggle: (value: boolean) => void;
  onClickEdit: () => void;
  onClickDelete: () => void;
  autoMarkScheduling?: boolean;
  acceptance: {
    percentage: number;
    total_responded?: number;
    total_count?: number;
  };
}> = ({ data, onToggle, onClickEdit, onClickDelete, autoMarkScheduling, acceptance }) => {
  return (
    <Card
      radius={'md'}
      py={'1rem'}
      pos={'relative'}
      sx={(theme) => ({
        border: '1px dashed ' + theme.colors.gray[2],
        overflow: 'unset',
      })}
    >
      <Group spacing={5} pos={'absolute'} top={-10} left={104} style={{ zIndex: 10 }} noWrap>
        <Badge
          fw={700}
          variant='light'
          size='sm'
          color={deterministicMantineColor(data.type || 'manually-added')}
        >
          {data.type ? data.type.replace('-', ' ') : 'CTA Type'}
        </Badge>

        <CtaAssets cta_id={data.id} />
      </Group>

      <Flex direction={'row'} w={'100%'} gap={'0.75rem'}>
        <Flex wrap={'wrap'} gap={'0.5rem'} align={'center'}>
          <Tooltip
            label={'Prospects: ' + acceptance.total_responded + '/' + acceptance.total_count}
            withArrow
            withinPortal
          >
            <Flex
              direction='column'
              align='center'
              style={{ borderRadius: 12, cursor: 'pointer' }}
              mr='md'
            >
              <Text color={'blue.6'} fw={700} fz={18}>
                {acceptance.percentage}%
              </Text>
              <Text color='blue.4' size='10px'>
                ACCEPTANCE
              </Text>
            </Flex>
          </Tooltip>
          {/* {data.tags.map((e) => (
              <Tooltip
                disabled={!e.hovered}
                label={e.hovered}
                withArrow
                withinPortal
              >
                <Button
                  key={e.label}
                  variant={e.variant}
                  size="xs"
                  color={e.color}
                  radius="xl"
                  h="auto"
                  fz={"0.75rem"}
                  py={"0.125rem"}
                  px={"0.25rem"}
                  fw={"400"}
                >
                  {e.label}
                  {e.highlight && (
                    <strong style={{ paddingLeft: 5 }}> {e.highlight}</strong>
                  )}
                </Button>
              </Tooltip>
            ))}
            {autoMarkScheduling && (
              <Tooltip
                label="Accepted invite will automatically classify prospect as 'scheduling'"
                withArrow
              >
                <Text sx={{ cursor: "pointer" }} size="sm">
                  🛎
                </Text>
              </Tooltip>
            )} */}
        </Flex>
        <Flex align={'center'} mr='md'>
          <Text color={'gray.8'} fw={500} fz='14px'>
            {data.label}
            <Tooltip label='Edit CTA'>
              <Button size='compact-xs' variant='subtle' ml='8px' fz='xs' onClick={onClickEdit}>
                <IconEdit size={14} />
              </Button>
            </Tooltip>
          </Text>
        </Flex>
        <Flex gap={'0.5rem'} align={'center'} ml={'auto'}>
          {autoMarkScheduling && (
            <Tooltip
              label="Accepted invite will automatically classify prospect as 'scheduling'"
              withArrow
            >
              <Text sx={{ cursor: 'pointer' }} size='sm'>
                🛎
              </Text>
            </Tooltip>
          )}
          <ActionIcon
            radius='xl'
            onClick={onClickDelete}
            sx={{
              visibility:
                acceptance?.total_count && acceptance?.total_count > 0 ? 'hidden' : 'visible',
              display: acceptance?.total_count && acceptance?.total_count > 0 ? 'none' : 'block',
              opacity: acceptance?.total_count && acceptance?.total_count > 0 ? 0.5 : 1,
              cursor:
                acceptance?.total_count && acceptance?.total_count > 0 ? 'not-allowed' : 'pointer',
            }}
          >
            <IconTrash size='1rem' />
          </ActionIcon>
          <Switch
            checked={data.checked}
            color={'green'}
            size='sm'
            onChange={({ currentTarget: { checked } }) => onToggle(checked)}
          />
        </Flex>
      </Flex>
    </Card>
  );
};
