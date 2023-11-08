import React, { useState, useEffect } from 'react';
import { Container, Grid, Text, Card, Table, Pagination, TextInput, Box, Badge, Progress, useMantineTheme, Loader } from '@mantine/core';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { IconCalendar, IconGlobe, IconSearch, IconSend, IconTarget, IconUpload } from '@tabler/icons';
import { API_URL } from '@constants/data';
import { useRecoilValue } from 'recoil';
import { userTokenState } from '@atoms/userAtoms';
import DOMPurify from 'isomorphic-dompurify';
import moment from 'moment';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const UploadOverview = () => {
  const [analytics, setAnalytics]: any = useState(null);
  const [currentPage, setCurrentPage]: any = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const userToken = useRecoilValue(userTokenState);
  const itemsPerPage = 10;
  const [sortField, setSortField] = useState('upload date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`${API_URL}/analytics/client_upload_analytics`, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + userToken,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.message === "Success") {
        setAnalytics(data.analytics);
      } else {
        console.error("Failed to fetch analytics data:", data.message);
        // Handle error case here
      }
    };

    fetchData();
  }, []);

  if (!analytics) {
    return <Box w='100%' h='100%' sx={{textAlign: 'center'}}><Loader ml='auto' mt='100px' mb='100px'/></Box>
  }

  // Sorting logic
  const sortedAnalytics = analytics.uploads.sort((a: any, b: any) => {
    if (a[sortField] < b[sortField]) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    if (a[sortField] > b[sortField]) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Function to handle sorting
  const handleSort = (field: any) => {
    setSortField(field);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = sortedAnalytics.slice(startIndex, endIndex);
  const theme = useMantineTheme();

  // Search filter function
  const totalFilteredItems = sortedAnalytics.filter((item: any) => {
    return item['upload name'].toLowerCase().includes(searchQuery.toLowerCase()) ||
           item['upload date'].toLowerCase().includes(searchQuery.toLowerCase()) || 
            item['account'].toLowerCase().includes(searchQuery.toLowerCase())
  })
  const filteredItems = totalFilteredItems.slice(startIndex, endIndex);
  

  const lineChartData: any = {
    labels: analytics.contacts_over_time.map((entry: any) => entry.x),
    datasets: [
      {
        label: 'Cumulative Total of Prospects',
        data: analytics.contacts_over_time.map((entry: any) => entry.y),
        fill: false,
        borderColor: theme.colors.blue[6],
        tension: 0.3
      },
      {
        type: 'bar', // Specify 'bar' type for this dataset
        label: 'Number of Uploads',
        data: analytics.contacts_over_time.map((entry: any) => entry.y), // Your uploads per day data
        backgroundColor: theme.colors.grape[0],
        borderColor: theme.colors.grape[3],
        borderWidth: 1,
      }
    ]
  };

  function getUploadName(uploadName: any) {
    uploadName = uploadName.replace(new RegExp(searchQuery, 'gi'), (match: any) => `<span style="background-color: ${theme.colors.yellow[1]}">${match}</span>`)
    return uploadName
  }

  return (
    <Container style={{ margin: '0 auto', maxWidth: 800 }} pt='lg' pb='xl'>
      {/* Section 1: Top Line Metrics with Icons */}
      <Grid>
        <Grid.Col span={4}>
          <Card withBorder padding="md">
            <Text align="center"><IconSearch size='1rem' /> Top Line Scraped</Text>
            <Text align="center" size="24px">{analytics.top_line_scraped.toLocaleString()}</Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={4}>
          <Card withBorder padding="md">
            <Text align="center"><IconUpload size='1rem' /> Top Line Uploaded</Text>
            <Text align="center" size="24px">{analytics.top_line_uploaded.toLocaleString()}</Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={4}>
          <Card withBorder padding="md">
            <Text align="center"><IconTarget size='1rem' /> Top Line Scored</Text>
            <Text align="center" size="24px">{analytics.top_line_scored.toLocaleString()}</Text>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Section 2: Line Graph */}
      <Box my="lg">
        <Line data={lineChartData} />
      </Box>

      {/* Section 3: Mantine Style Table with Search, Sortable Headers, and Pagination */}
      <TextInput
        placeholder="Search by Upload Name or Date"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.currentTarget.value)}
        style={{ marginBottom: '1em' }}
      />
      <Table striped>
        <thead>
          <tr>
            <th onClick={() => handleSort('upload name')}>Upload Name</th>
            <th onClick={() => handleSort('total prospects')}>Scraped</th>
            <th style={{textAlign: 'center'}}>Status</th>
            <th style={{textAlign: 'right'}} onClick={() => handleSort('upload date')}>Upload Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((upload: any, index: number) => (
            <tr key={index}>
              <td style={{width: '40%'}}>
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(getUploadName(upload['upload name'].substring(0, 45) + (upload['upload name'].length > 45 ? '...' : '')))
                  }}
                />
                <Text size='xs' color='gray'>
                  <div 
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(getUploadName(upload['account'] + "'s Account"))
                    }}
                  />
                </Text>
              </td>
              <td style={{width: '20%'}}>
                <Text>{upload.scraped} / {upload.scraped}</Text>
                <Progress value={100} color='blue' />
              </td>
              <td style={{width: '20%', textAlign: 'center'}}>
                <Badge color={upload.status === 'Complete' ? 'green' : 'yellow'} variant='outline'>{upload.status}</Badge>
              </td>
              <td style={{width: '20%', textAlign: 'right'}}>
                <IconCalendar size='0.8rem' style={{marginRight: '4px'}} /> {moment(upload['upload date']).format('MMM D, YYYY')}
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
  );
};

export default UploadOverview;
