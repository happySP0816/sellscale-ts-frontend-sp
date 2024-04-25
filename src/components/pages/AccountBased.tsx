import PageFrame from '@common/PageFrame';
import { Avatar, Box, Card, Flex, Text } from '@mantine/core';
import { Doughnut } from 'react-chartjs-2';

export default function AccountBased() {
  const data = [
    {
      avatar: '',
      name: 'Tesla',
      makers: 5,
      penetrate: 11,
    },
    {
      avatar: '',
      name: 'Tesla',
      makers: 56,
      penetrate: 41,
    },
  ];

  const piechartOptions = {
    responsive: true, // Ensure responsiveness is enabled
    maintainAspectRatio: false, // Allow the chart to resize in non-proportional ways to fit the container
    rotation: 270,
    circumference: 180,
    cutout: '78%',
    plugins: {
      legend: {
        display: false,
      },
    },
  };
  return (
    <PageFrame>
      <Flex direction={'column'} gap={'md'}>
        {data.map((item, index) => {
          const penetrateData = {
            labels: ['Label 1', 'Label 2'],
            datasets: [
              {
                data: [item.penetrate, 100 - item.penetrate], // Use item.percent for the first value
                backgroundColor: ['#2ea640', '#eaecf0'],
                borderWidth: 0,
                borderRadius: 1,
              },
            ],
          };

          return (
            <Card w='100%' withBorder radius={'md'} bg={'white'} key={index} p={0}>
              <Flex align={'center'} justify={'space-between'}>
                <Flex align={'center'} px={'sm'} gap={'sm'}>
                  <Avatar src={item.avatar} radius={'xl'} size={'md'} />
                  <Box>
                    <Text size={'md'} fw={700}>
                      {item.name}
                    </Text>
                    <Text size={'sm'} fw={600} sx={{ display: 'flex', gap: '3px' }}>
                      {item.makers}
                      <span style={{ color: '#868e96' }}>Decision Makers</span>
                    </Text>
                  </Box>
                </Flex>
                <div className='w-[140px] h-[100px] pr-4 relative'>
                  <Doughnut data={penetrateData} options={piechartOptions} />
                  <Flex
                    style={{
                      position: 'absolute',
                      top: '40px',
                      right: '8px',
                      width: '100%',
                      alignItems: 'center',
                    }}
                    direction={'column'}
                  >
                    <Text fw={600} size={'lg'}>
                      {item.penetrate}%
                    </Text>
                    <Text size={'xs'} color='gray' fw={500} mt={'-5px'}>
                      Penetrated
                    </Text>
                  </Flex>
                </div>
              </Flex>
            </Card>
          );
        })}
      </Flex>
    </PageFrame>
  );
}
