import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Collapse,
  Divider,
  Flex,
  Grid,
  Group,
  HoverCard,
  List,
  Modal,
  Select,
  Stack,
  Switch,
  Text,
  Textarea,
  Tooltip,
  useMantineTheme,
} from '@mantine/core';
import {
  IconArrowsDownUp,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconCircleCheck,
  IconCircleX,
  IconEdit,
  IconExternalLink,
  IconFileUnknown,
  IconInfoCircle,
  IconLetterT,
  IconLink,
  IconPencil,
  IconTrash,
} from '@tabler/icons';
import { useDisclosure } from '@mantine/hooks';
import { IconFileTypePdf, IconMessageCheck, IconPdf, IconSparkles } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { AssetType } from './AssetLibraryV2';
import { DataGrid } from 'mantine-data-grid';
import EmailSubject from './EmailSubject';
import LinkedinCTAs from './LinkedinCta';

export default function ListView(props: any) {
  const theme = useMantineTheme();

  const [usedPageSize, setUsedPageSize] = useState('25');
  const [unUsedPageSize, setUnUsedPageSize] = useState('25');

  const [openedUsed, { toggle: usedToggle }] = useDisclosure(true);
  const [openedUnUsed, { toggle: unusedToggle }] = useDisclosure(true);

  const [usedDetail, setUsedDetail] = useState(false);
  const [unusedDetail, setUnUsedDetail] = useState(false);
  const [usedDetailId, setUsedDetailId] = useState(-1);
  const [unusedDetailId, setUnUsedDetailId] = useState(-1);

  const [stepModalOpened, { open: stepOpen, close: stepClose }] = useDisclosure(false);
  const [useModalOpened, { open: useOpen, close: useClose }] = useDisclosure(false);
  const [assetModalOpened, { open: assetOpen, close: assetClose }] = useDisclosure(false);

  const [stepData, setStepData] = useState('Use in Any Step');
  const [stepValue, setStepValue] = useState('Use in Any Step');
  const [stepStatus, setStepStatus] = useState(false);
  const [stepKey, setStepKey] = useState();

  const useData = props.useData as AssetType[];
  const unUseData = props.unUseData as AssetType[];

  return (
    <Stack mt={'md'}>
      {props.type === 'generative' && props.semiTabs === 'email_subject_lines' ? (
        <EmailSubject />
      ) : props.type === 'generative' && props.semiTabs === 'linkedin_cta' ? (
        <LinkedinCTAs />
      ) : (
        <>
          <Flex gap={'sm'} align={'center'} w={'100%'} mt={'md'}>
            <Text sx={{ whiteSpace: 'nowrap' }} color='gray' fw={500}>
              Used Assets
            </Text>
            <Divider w={'100%'} />
            <ActionIcon onClick={usedToggle}>
              {openedUsed ? <IconChevronUp /> : <IconChevronDown />}
            </ActionIcon>
          </Flex>
          <Collapse in={openedUsed}>
            <DataGrid
              data={useData}
              highlightOnHover
              withPagination
              withSorting
              withColumnBorders
              withBorder
              sx={{
                cursor: 'pointer',
                '& .mantine-10xyzsm>tbody>tr>td': {
                  padding: '0px',
                },
                '& tr': {
                  background: 'white',
                },
              }}
              columns={[
                {
                  accessorKey: 'asset_name',
                  minSize: 220,
                  maxSize: 220,
                  header: () => (
                    <Flex align={'center'} gap={'3px'}>
                      <IconLetterT color='gray' size={'0.9rem'} />
                      <Text color='gray'>Asset Name</Text>
                    </Flex>
                  ),
                  cell: (cell) => {
                    return (
                      <Flex w={'100%'} h={'100%'} px={'sm'} align={'center'}>
                        <Text>{cell.row.original.asset_key}</Text>
                      </Flex>
                    );
                  },
                },
                {
                  accessorKey: 'details',
                  minSize: 400,
                  maxSize: 400,
                  header: () => (
                    <Flex align={'center'} gap={'3px'}>
                      <IconLetterT color='gray' size={'0.9rem'} />
                      <Text color='gray'>Details</Text>
                    </Flex>
                  ),
                  cell: (cell) => {
                    const { id } = cell.row.original;

                    return (
                      <Flex
                        px={'sm'}
                        h={'100%'}
                        mb={'xs'}
                        align={'center'}
                        w={'100%'}
                        sx={{ display: 'block' }}
                      >
                        <Flex
                          align={!usedDetail ? 'center' : 'start'}
                          justify='space-between'
                          w={'380px'}
                          gap={'xs'}
                          mt={'sm'}
                        >
                          <p
                            style={{
                              flex: 1,
                              whiteSpace: !usedDetail ? 'nowrap' : 'break-spaces',
                              ...(!usedDetail
                                ? { overflow: 'hidden', textOverflow: 'ellipsis' }
                                : {}),
                              fontSize: '13px',
                            }}
                          >
                            {cell.row.original.asset_raw_value || cell.row.original.asset_value}
                          </p>
                          <Flex align={'center'} gap={'4px'} mt={usedDetail ? 10 : 0}>
                            <Tooltip
                              withArrow
                              w={400}
                              label={cell.row.original.asset_raw_value || cell.row.original.asset_value}
                              styles={{
                                tooltip: {
                                  whiteSpace: 'normal',
                                },
                              }}
                            >
                              <div className='mt-2'>
                                <IconInfoCircle size={'1rem'} color='gray' />
                              </div>
                            </Tooltip>
                            <ActionIcon
                              onClick={() => {
                                setUsedDetail(!usedDetail);
                                setUsedDetailId(id);
                              }}
                            >
                              <IconArrowsDownUp size={'1rem'} />
                            </ActionIcon>
                          </Flex>
                        </Flex>
                        {usedDetail && usedDetailId === id && (
                          <Flex
                            p={'sm'}
                            direction={'column'}
                            bg={'#fff5ff'}
                            style={{ borderRadius: '8px', whiteSpace: 'break-spaces' }}
                          >
                            <Flex align={'center'} justify={'space-between'}>
                              <Text
                                color='#ec58fb'
                                size={'sm'}
                                fw={700}
                                style={{ display: 'flex', alignItems: 'center', gap: '3px' }}
                              >
                                <IconSparkles size={'1.4rem'} fill='pink' /> AI Summary
                              </Text>
                            </Flex>
                            <Text size={'xs'} mt={3}>
                              {'Some AI Summary'}
                            </Text>
                          </Flex>
                        )}
                      </Flex>
                    );
                  },
                },
                {
                  accessorKey: 'type',
                  minSize: 200,
                  maxSize: 200,
                  header: () => (
                    <Flex align={'center'} gap={'3px'}>
                      <IconLetterT color='gray' size={'0.9rem'} />
                      <Text color='gray'>Type</Text>
                    </Flex>
                  ),
                  cell: (cell) => {
                    return (
                      <Flex gap={'sm'} w={'100%'} px={'sm'} h={'100%'} align={'center'}>
                        <Badge>{cell.row.original.asset_tag}</Badge>
                      </Flex>
                    );
                  },
                },
                {
                  accessorKey: 'value',
                  header: () => (
                    <Flex align={'center'} gap={'3px'}>
                      <IconFileUnknown color='gray' size={'0.9rem'} />
                      <Text color='gray'>Value</Text>
                    </Flex>
                  ),
                  maxSize: 120,
                  minSize: 120,
                  enableResizing: true,
                  cell: (cell) => {
                    return (
                      <Flex
                        align={'center'}
                        justify={'center'}
                        gap={'xs'}
                        py={'lg'}
                        w={'100%'}
                        h={'100%'}
                      >
                        <Flex justify={'center'} w={'100%'} align={'center'} gap={'md'}>
                          <Badge>{cell.row.original.asset_type}</Badge>
                        </Flex>
                      </Flex>
                    );
                  },
                },
                {
                  accessorKey: 'open',
                  header: () => (
                    <Flex align={'center'} gap={'3px'}>
                      <IconMessageCheck color='gray' size={'0.9rem'} />
                      <Text color='gray'>Open Rate</Text>
                    </Flex>
                  ),
                  maxSize: 220,
                  minSize: 220,
                  enableResizing: true,
                  cell: (cell) => {
                    return (
                      <Flex
                        direction={'column'}
                        align={'center'}
                        justify={'center'}
                        w={'100%'}
                        h={'100%'}
                        py={'sm'}
                      >
                        <Badge color='green'>
                          {cell.row.original.num_sends === 0
                            ? '0%'
                            : `${((cell.row.original.num_opens / cell.row.original.num_sends) * 100).toFixed(2)}% Success`}
                        </Badge>
                      </Flex>
                    );
                  },
                },
                {
                  accessorKey: 'reply',
                  header: () => (
                    <Flex align={'center'} gap={'3px'}>
                      <IconMessageCheck color='gray' size={'0.9rem'} />
                      <Text color='gray'>Reply Rate</Text>
                    </Flex>
                  ),
                  enableResizing: true,
                  minSize: 230,
                  cell: (cell) => {
                    return (
                      <Flex
                        direction={'column'}
                        align={'center'}
                        justify={'center'}
                        gap={'xs'}
                        py={'lg'}
                        w={'100%'}
                        h={'100%'}
                      >
                        <Badge color='green'>
                          {cell.row.original.num_sends === 0
                            ? '0'
                            : cell.row.original.num_opens / cell.row.original.num_sends}% Success
                        </Badge>
                      </Flex>
                    );
                  },
                },
                {
                  accessorKey: 'action',
                  header: () => (
                    <Flex align={'center'} gap={'3px'}>
                      <IconMessageCheck color='gray' size={'0.9rem'} />
                      <Text color='gray'>Action</Text>
                    </Flex>
                  ),
                  enableResizing: true,
                  minSize: 100,
                  cell: (cell) => {
                    const {} = cell.row.original;

                    return (
                      <Flex
                        direction={'column'}
                        align={'center'}
                        justify={'center'}
                        gap={'xs'}
                        py={'lg'}
                        w={'100%'}
                        h={'100%'}
                      >
                        <Flex gap={'xs'} align={'center'}>
                          <Switch size='xs' />
                          <Badge
                            color='yellow'
                            radius={'xl'}
                            sx={{ paddingTop: '6px', paddingInline: '2px' }}
                          >
                            <IconPencil size={'1rem'} />
                          </Badge>
                          <Badge
                            color='red'
                            radius={'xl'}
                            sx={{ paddingTop: '6px', paddingInline: '2px' }}
                          >
                            <IconTrash size={'1rem'} />
                          </Badge>
                        </Flex>
                      </Flex>
                    );
                  },
                },
              ]}
              options={{
                enableFilters: true,
              }}
              //   loading={loading}
              components={{
                pagination: ({ table }) => (
                  <Flex
                    justify={'space-between'}
                    align={'center'}
                    px={'sm'}
                    py={'1.25rem'}
                    sx={(theme) => ({
                      border: `1px solid ${theme.colors.gray[4]}`,
                      borderTopWidth: 0,
                    })}
                  >
                    <Select
                      style={{ width: '150px' }}
                      data={[
                        { label: 'Show 25 rows', value: '25' },
                        { label: 'Show 10 rows', value: '10' },
                        { label: 'Show 5 rows', value: '5' },
                      ]}
                      value={usedPageSize}
                      onChange={(v) => {
                        setUsedPageSize(v ?? '25');
                      }}
                    />
                    <Flex align={'center'} gap={'sm'}>
                      <Flex align={'center'}>
                        <Select
                          maw={100}
                          value={`${table.getState().pagination.pageIndex + 1}`}
                          data={new Array(table.getPageCount()).fill(0).map((i, idx) => ({
                            label: String(idx + 1),
                            value: String(idx + 1),
                          }))}
                          onChange={(v) => {
                            table.setPageIndex(Number(v) - 1);
                          }}
                        />
                        <Flex
                          sx={(theme) => ({
                            borderTop: `1px solid ${theme.colors.gray[4]}`,
                            borderRight: `1px solid ${theme.colors.gray[4]}`,
                            borderBottom: `1px solid ${theme.colors.gray[4]}`,
                            marginLeft: '-2px',
                            paddingLeft: '1rem',
                            paddingRight: '1rem',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '0.25rem',
                          })}
                          h={36}
                        >
                          <Text color='gray.5' fw={500} fz={14}>
                            of {table.getPageCount()} pages
                          </Text>
                        </Flex>
                        <ActionIcon
                          variant='default'
                          color='gray.4'
                          h={36}
                          disabled={table.getState().pagination.pageIndex === 0}
                          onClick={() => {
                            table.setPageIndex(table.getState().pagination.pageIndex - 1);
                          }}
                        >
                          <IconChevronLeft stroke={theme.colors.gray[4]} />
                        </ActionIcon>
                        <ActionIcon
                          variant='default'
                          color='gray.4'
                          h={36}
                          disabled={
                            table.getState().pagination.pageIndex === table.getPageCount() - 1
                          }
                          onClick={() => {
                            table.setPageIndex(table.getState().pagination.pageIndex + 1);
                          }}
                        >
                          <IconChevronRight stroke={theme.colors.gray[4]} />
                        </ActionIcon>
                      </Flex>
                    </Flex>
                  </Flex>
                ),
              }}
              w={'100%'}
              pageSizes={[usedPageSize]}
              styles={(theme) => ({
                thead: {
                  height: '44px',
                  backgroundColor: theme.colors.gray[0],
                  '::after': {
                    backgroundColor: 'transparent',
                  },
                },

                wrapper: {
                  gap: 0,
                },
                scrollArea: {
                  paddingBottom: 0,
                  gap: 0,
                },

                dataCellContent: {
                  width: '100%',
                },
              })}
            />
          </Collapse>
          <Flex gap={'sm'} align={'center'} w={'100%'}>
            <Text sx={{ whiteSpace: 'nowrap' }} color='gray' fw={500}>
              Un-used Assets
            </Text>
            <Divider w={'100%'} />
            <ActionIcon onClick={unusedToggle}>
              {openedUnUsed ? <IconChevronUp /> : <IconChevronDown />}
            </ActionIcon>
          </Flex>
          <Collapse in={openedUnUsed} mb={'md'}>
            <DataGrid
              data={unUseData}
              highlightOnHover
              withPagination
              withSorting
              withColumnBorders
              withBorder
              sx={{
                cursor: 'pointer',
                '& .mantine-10xyzsm>tbody>tr>td': {
                  padding: '0px',
                },
                '& tr': {
                  background: 'white',
                },
              }}
              columns={[
                {
                  accessorKey: 'asset_name',
                  minSize: 220,
                  maxSize: 220,
                  header: () => (
                    <Flex align={'center'} gap={'3px'}>
                      <IconLetterT color='gray' size={'0.9rem'} />
                      <Text color='gray'>Asset Name</Text>
                    </Flex>
                  ),
                  cell: (cell) => {
                    // const { status } = cell.row.original;

                    return (
                      <Flex w={'100%'} h={'100%'} px={'sm'} align={'center'}>
                        <Text>{cell.row.original.asset_key}</Text>
                      </Flex>
                    );
                  },
                },
                {
                  accessorKey: 'details',
                  minSize: 400,
                  maxSize: 400,
                  header: () => (
                    <Flex align={'center'} gap={'3px'}>
                      <IconLetterT color='gray' size={'0.9rem'} />
                      <Text color='gray'>Details</Text>
                    </Flex>
                  ),

                  cell: (cell) => {
                    // @ts-ignore
                    const { id } = cell.row.original;

                    return (
                      <Flex
                        px={'sm'}
                        h={'100%'}
                        mb={'xs'}
                        justify={'center'}
                        align={'center'}
                        w={'100%'}
                        sx={{ display: 'block' }}
                      >
                        <Flex
                          align={!unusedDetail ? 'center' : 'start'}
                          justify='space-between'
                          w={'380px'}
                          gap={'xs'}
                          mt={'sm'}
                        >
                          <p
                            style={{
                              flex: 1,
                              whiteSpace: !unusedDetail ? 'nowrap' : 'break-spaces',
                              ...(!unusedDetail
                                ? { overflow: 'hidden', textOverflow: 'ellipsis' }
                                : {}),
                              fontSize: '13px',
                            }}
                          >
                            {cell.row.original.asset_raw_value || cell.row.original.asset_value}
                          </p>
                          <Flex align={'center'} gap={'4px'} mt={unusedDetail ? 10 : 0}>
                            <Tooltip
                              withArrow
                              w={400}
                              label={cell.row.original.asset_raw_value || cell.row.original.asset_value}
                              styles={{
                                tooltip: {
                                  whiteSpace: 'normal',
                                },
                              }}
                            >
                              <div className='mt-2'>
                                <IconInfoCircle size={'1rem'} color='gray' />
                              </div>
                            </Tooltip>
                            <ActionIcon
                              onClick={() => {
                                setUnUsedDetail(!unusedDetail);
                                setUnUsedDetailId(id);
                              }}
                            >
                              <IconArrowsDownUp size={'1rem'} />
                            </ActionIcon>
                          </Flex>
                        </Flex>
                        {unusedDetail && unusedDetailId === id && (
                          <Flex
                            p={'sm'}
                            direction={'column'}
                            bg={'#fff5ff'}
                            style={{ borderRadius: '8px', whiteSpace: 'break-spaces' }}
                          >
                            <Flex align={'center'} justify={'space-between'}>
                              <Text
                                color='#ec58fb'
                                size={'sm'}
                                fw={700}
                                style={{ display: 'flex', alignItems: 'center', gap: '3px' }}
                              >
                                <IconSparkles size={'1.4rem'} fill='pink' /> AI Summary
                              </Text>
                            </Flex>
                            <Text size={'xs'} mt={3}>
                              This case study explores how lorem Ipsum dolor sit amet, consectetur
                              adipiscing elit testsdsdasdfasdasdfasdfasdfasdf'
                            </Text>
                          </Flex>
                        )}
                      </Flex>
                    );
                  },
                },
                {
                  accessorKey: 'type',
                  minSize: 200,
                  maxSize: 200,
                  header: () => (
                    <Flex align={'center'} gap={'3px'}>
                      <IconLetterT color='gray' size={'0.9rem'} />
                      <Text color='gray'>Type</Text>
                    </Flex>
                  ),
                  cell: (cell) => {
                    // const { rep, rep_profile_picture } = cell.row.original;

                    return (
                      <Flex gap={'sm'} w={'100%'} px={'sm'} h={'100%'} align={'center'}>
                        <Badge>{cell.row.original.asset_tag}</Badge>
                      </Flex>
                    );
                  },
                },
                {
                  accessorKey: 'value',
                  header: () => (
                    <Flex align={'center'} gap={'3px'}>
                      <IconFileUnknown color='gray' size={'0.9rem'} />
                      <Text color='gray'>Value</Text>
                    </Flex>
                  ),
                  maxSize: 120,
                  minSize: 120,
                  enableResizing: true,
                  cell: (cell) => {
                    // const {  } = cell.row.original;

                    return (
                      <Flex
                        align={'center'}
                        justify={'center'}
                        gap={'xs'}
                        py={'lg'}
                        w={'100%'}
                        h={'100%'}
                      >
                        <Flex justify={'center'} w={'100%'} align={'center'} gap={'md'}>
                          <Badge>{cell.row.original.asset_type}</Badge>
                        </Flex>
                      </Flex>
                    );
                  },
                },
                {
                  accessorKey: 'open',
                  header: () => (
                    <Flex align={'center'} gap={'3px'}>
                      <IconMessageCheck color='gray' size={'0.9rem'} />
                      <Text color='gray'>Open Rate</Text>
                    </Flex>
                  ),
                  maxSize: 220,
                  minSize: 220,
                  enableResizing: true,
                  cell: (cell) => {
                    // const {  } = cell.row.original;

                    return (
                      <Flex
                        direction={'column'}
                        align={'center'}
                        justify={'center'}
                        w={'100%'}
                        h={'100%'}
                        py={'sm'}
                      >
                        <Badge color='green'>
                          {cell.row.original.num_sends === 0
                            ? '0%'
                            : `${((cell.row.original.num_opens / cell.row.original.num_sends) * 100).toFixed(2)}% Success`}
                        </Badge>
                      </Flex>
                    );
                  },
                },
                {
                  accessorKey: 'reply',
                  header: () => (
                    <Flex align={'center'} gap={'3px'}>
                      <IconMessageCheck color='gray' size={'0.9rem'} />
                      <Text color='gray'>Reply Rate</Text>
                    </Flex>
                  ),
                  enableResizing: true,
                  minSize: 230,
                  cell: (cell) => {
                    return (
                      <Flex
                        direction={'column'}
                        align={'center'}
                        justify={'center'}
                        gap={'xs'}
                        py={'lg'}
                        w={'100%'}
                        h={'100%'}
                      >
                        <Badge color='green'>
                          {cell.row.original.num_sends === 0
                            ? '0%'
                            : `${((cell.row.original.num_opens / cell.row.original.num_sends) * 100).toFixed(2)}% Success`}
                        </Badge>
                      </Flex>
                    );
                  },
                },
                {
                  accessorKey: 'action',
                  header: () => (
                    <Flex align={'center'} gap={'3px'}>
                      <IconMessageCheck color='gray' size={'0.9rem'} />
                      <Text color='gray'>Action</Text>
                    </Flex>
                  ),
                  enableResizing: true,
                  minSize: 100,
                  cell: (cell) => {
                    const {} = cell.row.original;

                    return (
                      <Flex
                        direction={'column'}
                        align={'center'}
                        justify={'center'}
                        gap={'xs'}
                        py={'lg'}
                        w={'100%'}
                        h={'100%'}
                      >
                        <Flex gap={'xs'} align={'center'}>
                          <Switch size='xs' />
                          <Badge
                            color='yellow'
                            radius={'xl'}
                            sx={{ paddingTop: '6px', paddingInline: '2px' }}
                          >
                            <IconPencil size={'1rem'} />
                          </Badge>
                          <Badge
                            color='red'
                            radius={'xl'}
                            sx={{ paddingTop: '6px', paddingInline: '2px' }}
                          >
                            <IconTrash size={'1rem'} />
                          </Badge>
                        </Flex>
                      </Flex>
                    );
                  },
                },
              ]}
              options={{
                enableFilters: true,
              }}
              //   loading={loading}
              components={{
                pagination: ({ table }) => (
                  <Flex
                    justify={'space-between'}
                    align={'center'}
                    px={'sm'}
                    py={'1.25rem'}
                    sx={(theme) => ({
                      border: `1px solid ${theme.colors.gray[4]}`,
                      borderTopWidth: 0,
                    })}
                  >
                    <Select
                      style={{ width: '150px' }}
                      data={[
                        { label: 'Show 25 rows', value: '25' },
                        { label: 'Show 10 rows', value: '10' },
                        { label: 'Show 5 rows', value: '5' },
                      ]}
                      value={unUsedPageSize}
                      onChange={(v) => {
                        setUnUsedPageSize(v ?? '25');
                      }}
                    />
                    <Flex align={'center'} gap={'sm'}>
                      <Flex align={'center'}>
                        <Select
                          maw={100}
                          value={`${table.getState().pagination.pageIndex + 1}`}
                          data={new Array(table.getPageCount()).fill(0).map((i, idx) => ({
                            label: String(idx + 1),
                            value: String(idx + 1),
                          }))}
                          onChange={(v) => {
                            table.setPageIndex(Number(v) - 1);
                          }}
                        />
                        <Flex
                          sx={(theme) => ({
                            borderTop: `1px solid ${theme.colors.gray[4]}`,
                            borderRight: `1px solid ${theme.colors.gray[4]}`,
                            borderBottom: `1px solid ${theme.colors.gray[4]}`,
                            marginLeft: '-2px',
                            paddingLeft: '1rem',
                            paddingRight: '1rem',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '0.25rem',
                          })}
                          h={36}
                        >
                          <Text color='gray.5' fw={500} fz={14}>
                            of {table.getPageCount()} pages
                          </Text>
                        </Flex>
                        <ActionIcon
                          variant='default'
                          color='gray.4'
                          h={36}
                          disabled={table.getState().pagination.pageIndex === 0}
                          onClick={() => {
                            table.setPageIndex(table.getState().pagination.pageIndex - 1);
                          }}
                        >
                          <IconChevronLeft stroke={theme.colors.gray[4]} />
                        </ActionIcon>
                        <ActionIcon
                          variant='default'
                          color='gray.4'
                          h={36}
                          disabled={
                            table.getState().pagination.pageIndex === table.getPageCount() - 1
                          }
                          onClick={() => {
                            table.setPageIndex(table.getState().pagination.pageIndex + 1);
                          }}
                        >
                          <IconChevronRight stroke={theme.colors.gray[4]} />
                        </ActionIcon>
                      </Flex>
                    </Flex>
                  </Flex>
                ),
              }}
              w={'100%'}
              pageSizes={[usedPageSize]}
              styles={(theme) => ({
                thead: {
                  height: '44px',
                  backgroundColor: theme.colors.gray[0],
                  '::after': {
                    backgroundColor: 'transparent',
                  },
                },

                wrapper: {
                  gap: 0,
                },
                scrollArea: {
                  paddingBottom: 0,
                  gap: 0,
                },

                dataCellContent: {
                  width: '100%',
                },
              })}
            />
          </Collapse>
        </>
      )}
    </Stack>
  );
}
