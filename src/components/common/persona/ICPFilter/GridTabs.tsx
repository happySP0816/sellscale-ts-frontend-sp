import { Box, Button, Divider, Flex, Text, useMantineTheme } from '@mantine/core'
import { getICPScoreColor, getStatusMessageBadgeColor } from '../../../../utils/icp'
import { useEffect, useMemo, useState } from 'react'

interface IGridTabsProps {
  selectedTab: {
    label: string
    value: string
    count: number
  }
  setSelectedTab: (value: { label: string; value: string; count: number }) => void
  icpDashboard: {
    label: string
    color: string
    bgColor: string
    percent: number
    value: string
    widthModifier: number
  }[]
  numProspects: number
}

const GridTabs = ({ selectedTab, setSelectedTab, icpDashboard, numProspects }: IGridTabsProps) => {
  const theme = useMantineTheme()
  const computeTabFilters = () => {
    return [
      {
        label: 'All',
        value: 'all',
        count: numProspects,
      },
      {
        label: 'Very High',
        value: '4',
        count: icpDashboard.find((c) => c.label === 'Very High')?.value || '0',
      },
      {
        label: 'High',
        value: '3',
        count: icpDashboard.find((c) => c.label === 'High')?.value || '0',
      },
      {
        label: 'Medium',
        value: '2',
        count: icpDashboard.find((c) => c.label === 'Medium')?.value || '0',
      },
      {
        label: 'Low',
        value: '1',
        count: icpDashboard.find((c) => c.label === 'Low')?.value || '0',
      },
      {
        label: 'Very Low',
        value: '0',
        count: icpDashboard.find((c) => c.label === 'Very Low')?.value || '0',
      },
      {
        label: 'Unscored',
        value: '-1',
        count: icpDashboard.find((c) => c.label === 'Unscored')?.value || '0',
      },
    ]
  }
  const [tabFilters, setTabFilters] = useState(computeTabFilters())

  useEffect(() => {
    setTabFilters(computeTabFilters())
  }, [icpDashboard])

  const generateBackgroundBudge = (value: string) => {
    const COLORS: { [key: string]: string } = {
      all: theme.colors.gray[4],
      'very high': theme.colors.green[1],
      high: theme.colors.blue[1],
      medium: theme.colors.yellow[1],
      low: theme.colors.red[1],
      'very low': theme.colors.red[1],
      unscored: theme.colors.gray[1],
    }

    return COLORS[value?.toLowerCase()]
  }
  return (
    <Flex justify={'space-between'} align={'center'}>
      <Flex
        // gap={"0.5rem"}
        justify={'space-between'}
        align={'center'}
        w={'100%'}
        style={{ border: '1px solid gray', borderRadius: '5px' }}
      >
        {tabFilters.map((tab: any, idx) => (
          <>
            <Button
              key={tab.value}
              variant='subtle'
              size='sm'
              w={'100%'}
              onClick={() => setSelectedTab(tab)}
              style={{
                // padding: '0.5rem 1rem',
                backgroundColor:
                  selectedTab.value === tab.value ? getStatusMessageBadgeColor(tab.label).filled : 'white',
                // borderRight: '1px solid #E0E0E0',
                color: selectedTab.value === tab.value ? '#fff' : getICPScoreColor(tab.label),
                fontWeight: 600,
                // border: `1px solid gray`,
              }}
            >
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {tab.label}

                <Box
                  bg={
                    selectedTab.value === tab.value
                      ? tab.value === 'all'
                        ? '#84818A'
                        : getStatusMessageBadgeColor(tab.label).filled
                      : generateBackgroundBudge(tab.label)
                  }
                  px={'0.5rem'}
                  style={{ borderRadius: 99 }}
                >
                  <Text
                    size={'0.75rem'}
                    color={
                      selectedTab.value === tab.value || tab.value === 'all'
                        ? '#fff'
                        : getStatusMessageBadgeColor(tab.label).filled
                    }
                  >
                    {tab.count}
                  </Text>
                </Box>
              </Box>
            </Button>
            {idx !== tabFilters.length - 1 && <Divider orientation='vertical' color='#E0E0E0' size='sm' mt={6} style={{ height: '24px' }} />}
          </>
        ))}
      </Flex>
    </Flex>
  )
}

export default GridTabs
