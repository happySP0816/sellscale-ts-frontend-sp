import { userTokenState } from "@atoms/userAtoms";
import YourNetworkSection from "@common/your_network/YourNetworkSection";
import { Card, Flex, Tabs, Title, Text, TextInput, Anchor, NumberInput, Tooltip, Button, ActionIcon, Badge, useMantineTheme, Loader, Group, Stack, Box } from "@mantine/core";
import { useForm } from "@mantine/form";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { IconAffiliate, IconBrandLinkedin, IconDownload } from "@tabler/icons";
import { setPageTitle } from "@utils/documentChange";
import { valueToColor } from "@utils/general";
import getSalesNavigatorLaunches, { getSalesNavigatorLaunch } from "@utils/requests/getSalesNavigatorLaunches";
import postLaunchSalesNavigator from "@utils/requests/postLaunchSalesNavigator";
import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import { SalesNavigatorLaunch } from "src";

export default function FindContactsPage() {
  setPageTitle("Find Contacts")
  const userToken = useRecoilValue(userTokenState);
  const theme = useMantineTheme()

  const [loading, setLoading] = useState(false)
  const [launches, setLaunches] = useState<SalesNavigatorLaunch[]>([])
  const launchName = useRef<HTMLInputElement>(null)

  const triggerGetSalesNavigatorLaunches = async () => {
    setLoading(true)

    const result = await getSalesNavigatorLaunches(userToken)
    if (result.status != 'success') {
      showNotification({
        title: "Could not retrieve Sales Navigator launches",
        message: result.message,
      })
    }
    setLaunches(result.data.launches)

    setLoading(false)
  }

  const triggerGetSalesNavigatorLaunch = async (launch_id: number) => {
    setLoading(true)

    const result = await getSalesNavigatorLaunch(userToken, launch_id)

    setLoading(false)
  }

  const triggerPostLaunchSalesNavigator = async () => {
    setLoading(true)

    const result = await postLaunchSalesNavigator(userToken, salesNavigatorForm.values.url, salesNavigatorForm.values.numberOfContacts, launchName.current!.value)
    if (result.status != 'success') {
      showNotification({
        title: "Could not launch Scraper",
        message: result.message,
      })
    } else {
      showNotification({
        title: "Sales Navigator Launched",
        message: "Your Sales Navigator search has been launched. This may take a few minutes.",
      })
      salesNavigatorForm.reset()
      triggerGetSalesNavigatorLaunches()
    }

    setLoading(false)
  }

  useEffect(() => {
    triggerGetSalesNavigatorLaunches()

    // Call myFunction every 20 seconds
    const intervalId = setInterval(triggerGetSalesNavigatorLaunches, 20000); // 20,000 milliseconds = 20 seconds

    // Clean up the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, [])

  const salesNavigatorForm = useForm({
    initialValues: {
      url: "",
      numberOfContacts: 0
    }
  })

  return (
    <Flex p='lg' direction='column'>
      <Title>
        Find Contacts
      </Title>
      <Tabs defaultValue="linkedin-sales-navigator" mt='md'>
        <Tabs.List>
          <Tabs.Tab value="linkedin-sales-navigator" icon={<IconBrandLinkedin size="0.8rem" />}>LinkedIn Sales Navigator</Tabs.Tab>
          <Tabs.Tab value="your-network" icon={<IconAffiliate size="0.8rem" />}>Your Network</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="linkedin-sales-navigator" pt="xs">
          <Card shadow="sm" p="lg" mt='sm'>
            <Title order={4}>
              LinkedIn Sales Navigator
            </Title>
            <Text>
              Use a <Anchor href='https://www.linkedin.com/sales/search/people' target="_blank">LinkedIn sales navigator</Anchor> search to find contacts.
            </Text>
            <Flex mt='lg' align='center'>
              <TextInput
                w='400px'
                label='LinkedIn Sales Navigator URL'
                placeholder="https://www.linkedin.com/sales/search/people..."
                icon={<IconBrandLinkedin size="0.8rem" />}
                value={salesNavigatorForm.values.url}
                onChange={(event) => salesNavigatorForm.setFieldValue("url", event.currentTarget.value)}
                required
                withAsterisk
                error={
                  salesNavigatorForm.values.url && !salesNavigatorForm.values.url.startsWith("https://www.linkedin.com/sales/search/people") &&
                  true
                }
              />
              <Tooltip label="The number of contacts to find; capped at 1,000 contacts per search." withinPortal withArrow>
                <NumberInput
                  ml='lg'
                  label="Number of contacts"
                  placeholder="100"
                  withAsterisk
                  min={0}
                  max={1000}
                  value={salesNavigatorForm.values.numberOfContacts}
                  onChange={(event) => salesNavigatorForm.setFieldValue("numberOfContacts", event as number)}
                  required
                />
              </Tooltip>
              <Button
                ml='xl'
                disabled={
                  salesNavigatorForm.values.numberOfContacts === 0 ||
                  salesNavigatorForm.values.url === "" ||
                  !salesNavigatorForm.values.url.startsWith("https://www.linkedin.com/sales/search/people")
                }
                loading={loading}
                onClick={() => {
                  openConfirmModal({
                    title: "Launch Sales Navigator",
                    children: (
                      <TextInput
                        withAsterisk
                        label='Name your Sales Navigator search'
                        description='This name will be used to help you to identify your search in the future.'
                        placeholder="My Sales Navigator Search"
                        ref={launchName}
                        onChange={(event) => { launchName.current!.value = event.currentTarget.value }}
                      />
                    ),
                    labels: { confirm: 'Launch Scraper', cancel: 'Cancel' },
                    confirmProps: { disabled: launchName.current?.value === "" },
                    onCancel: () => { },
                    onConfirm: () => { triggerPostLaunchSalesNavigator() }
                  })
                }}
              >
                Find Contacts
              </Button>
            </Flex>

            {launches && launches.length > 0 && launches.map((launch, index) => {
              const dateObject = new Date(launch.launch_date)
              const date = dateObject.toLocaleDateString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })

              let badgeColor
              if (launch.status === "SUCCESS") {
                badgeColor = theme.colors.green[6]
              } else if (launch.status === "RUNNING") {
                badgeColor = theme.colors.orange[6]
              } else if (launch.status === "QUEUED") {
                badgeColor = theme.colors.gray[6]
              } else {
                badgeColor = theme.colors.red[6]
              }

              return (
                <Card mt='lg' p='lg' shadow='sm' withBorder>
                  <Flex align='center' justify='space-between'>
                    <Flex align='center'>
                      <Title order={5}>
                        {launch.name || `Scrape #${launches.length - index}`} 
                      </Title>
                      <Text ml='sm' fz='xs'>
                        {date}
                      </Text>
                      <Badge
                        color={badgeColor}
                        size='sm'
                        ml='md'
                        variant='outline'
                      >
                        {launch.status}
                      </Badge>
                    </Flex>
                    {
                      launch.status === "SUCCESS" ?
                        <Tooltip label="Download CSV" withinPortal withArrow>
                          <ActionIcon onClick={() => triggerGetSalesNavigatorLaunch(launch.id)}>
                            <IconDownload size='1.2rem' />
                          </ActionIcon>
                        </Tooltip>
                        :
                        <Tooltip label="This scrape has not finished yet. Please check back later.">
                          <Loader mr='xs' size='xs' variant='dots' />
                        </Tooltip>
                    }
                  </Flex>
                  <Text>
                    {launch.scrape_count} contacts
                  </Text>
                  <Anchor size='sm' href={launch.sales_navigator_url} target="_blank">View Original Filters</Anchor>
                </Card>
              )
            })}
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="your-network" pt="xs">
          <YourNetworkSection />
        </Tabs.Panel>

      </Tabs>

    </Flex>
  )
}