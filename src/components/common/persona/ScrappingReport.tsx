import React, { useState, useEffect } from 'react'
import {
  Container,
  Text,
  Card,
  Table,
  Pagination,
  TextInput,
  Box,
  Badge,
  Progress,
  useMantineTheme,
  Loader,
  Stack,
  Flex,
  Avatar,
} from '@mantine/core'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js'
import { IconExternalLink, IconSearch, IconCalendar } from '@tabler/icons'
import { API_URL } from '@constants/data'
import { useRecoilValue } from 'recoil'
import { userTokenState } from '@atoms/userAtoms'
import DOMPurify from 'isomorphic-dompurify'
import moment from 'moment'
import { IconSelector } from '@tabler/icons-react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

const ScrappingReport = () => {
  const [analytics, setAnalytics]: any = useState(null)
  const [currentPage, setCurrentPage]: any = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const userToken = useRecoilValue(userTokenState)
  const itemsPerPage = 10
  const [sortField, setSortField] = useState('upload date')
  const [sortOrder, setSortOrder] = useState('desc')

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        border: { dash: [4, 4] },
        beginAtZero: false,
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
        },
      },
    },
  }

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`${API_URL}/analytics/client_upload_analytics`, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + userToken,
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (data.message === 'Success') {
        setAnalytics(data.analytics)
      } else {
        console.error('Failed to fetch analytics data:', data.message)
        // Handle error case here
      }
    }

    fetchData()
  }, [])

  if (!analytics) {
    return (
      <Box w='100%' h='100%' sx={{ textAlign: 'center' }}>
        <Loader ml='auto' mt='100px' mb='100px' />
      </Box>
    )
  }

  // Sorting logic
  const sortedAnalytics = analytics.uploads.sort((a: any, b: any) => {
    if (a[sortField] < b[sortField]) {
      return sortOrder === 'asc' ? -1 : 1
    }
    if (a[sortField] > b[sortField]) {
      return sortOrder === 'asc' ? 1 : -1
    }
    return 0
  })

  // Function to handle sorting
  const handleSort = (field: any) => {
    setSortField(field)
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
  }

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = sortedAnalytics.slice(startIndex, endIndex)
  const theme = useMantineTheme()

  // Search filter function
  const totalFilteredItems = sortedAnalytics.filter((item: any) => {
    return (
      item['upload name'].toLowerCase().includes(searchQuery.toLowerCase()) ||
      item['upload date'].toLowerCase().includes(searchQuery.toLowerCase()) ||
      item['account'].toLowerCase().includes(searchQuery.toLowerCase())
    )
  })
  const filteredItems = totalFilteredItems.slice(startIndex, endIndex)

  const lineChartData: any = {
    labels: analytics.contacts_over_time.map((entry: any) => entry.x),
    datasets: [
      {
        label: 'Cumulative Total of Prospects',
        data: analytics.contacts_over_time.map((entry: any) => entry.y),
        fill: false,
        borderColor: theme.colors.blue[6],
        tension: 0.3,
      },
      {
        type: 'bar', // Specify 'bar' type for this dataset
        label: 'Number of Uploads',
        data: analytics.contacts_over_time.map((entry: any) => entry.y), // Your uploads per day data
        backgroundColor: theme.colors.grape[0],
        borderColor: theme.colors.grape[3],
        borderWidth: 1,
      },
    ],
  }

  function getUploadName(uploadName: any) {
    uploadName = uploadName.replace(
      new RegExp(searchQuery, 'gi'),
      (match: any) => `<span style="background-color: ${theme.colors.yellow[1]}">${match}</span>`
    )
    return uploadName
  }

  console.log(filteredItems)

  return (
    <Container size='97%' my={'lg'}>
      <Text fw={600} size={'xl'} mb={'lg'}>
        Cumulative Scraping Analytics
      </Text>
      <Card style={{ width: '100%', height: '400px' }} shadow='md' radius={'md'}>
        <Line data={lineChartData} options={chartOptions} />
      </Card>
      <Flex align={'center'} justify={'space-between'} my={'lg'}>
        <Text fw={600} size={'xl'}>
          Scraping Report
        </Text>
        <TextInput
          placeholder='Search'
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.currentTarget.value)}
          rightSection={<IconSearch color='gray' />}
        />
      </Flex>
      <Table withBorder style={{ borderRadius: '8px' }}>
        <thead style={{ background: '#f9f9fd', width: '100%' }}>
          <tr style={{ height: '60px' }}>
            <th style={{}} onClick={() => handleSort('upload name')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                Upload Name
                <IconSelector size={14} />
              </div>
            </th>
            <th>SDR</th>
            <th onClick={() => handleSort('total prospects')}>Scraped</th>
            <th style={{ textAlign: 'center' }}>Status</th>
            <th onClick={() => handleSort('upload date')}>
              <div
                style={{
                  cursor: 'pointer',
                  justifyContent: 'end',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                Upload Date
                <IconSelector size={14} />
              </div>
            </th>
          </tr>
        </thead>
        <tbody style={{ background: 'white' }}>
          {filteredItems.map((upload: any, index: number) => (
            <tr key={index}>
              <td style={{ width: '25%' }}>
                <Flex my={4} align={'center'}>
                  <Avatar size={'lg'} radius={'xl'} />
                  <Stack>
                    <Text size={16} className=' line-clamp-1'>
                      {upload['upload name']}
                    </Text>
                    <Text
                      size='10'
                      color='blue'
                      mt={-15}
                      style={{ display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }}
                    >
                      Associated Campaign
                      <IconExternalLink size={14} />
                    </Text>
                  </Stack>
                </Flex>
              </td>
              <td style={{ width: '20%' }}>
                <Flex align={'center'}>
                  <Avatar src={upload?.avatar} size={'md'} radius={'xl'} />
                  <Stack>
                    <Text style={{ display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
                      {upload.account} <IconExternalLink size={14} color='#478cef' />
                    </Text>
                    <Text size='xs' color='gray' mt={-20}>
                      GTM Leadership
                    </Text>
                  </Stack>
                </Flex>
              </td>
              <td style={{ width: '20%' }}>
                <Progress value={(upload.scraped / 150) * 100} color='blue' />
                <Text mt={4}>
                  {upload.scraped} <span style={{ color: 'gray' }}> out of 3000</span>
                </Text>
              </td>
              <td style={{ width: '20%', textAlign: 'center' }}>
                <Badge color={upload.status === 'Complete' ? 'green' : 'yellow'} variant='outline'>
                  {upload.status}
                </Badge>
              </td>
              <td style={{ width: '20%', textAlign: 'right' }}>
                <IconCalendar size='0.8rem' style={{ marginRight: '4px' }} />{' '}
                {moment(upload['upload date']).format('MMM D, YYYY')}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Pagination
        // @ts-ignore
        page={currentPage}
        onChange={setCurrentPage}
        total={Math.ceil(totalFilteredItems.length / itemsPerPage)}
        style={{ marginTop: '1em' }}
      />
    </Container>
  )
}

export default ScrappingReport
