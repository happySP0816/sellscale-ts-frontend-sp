import { userTokenState } from "@atoms/userAtoms";
import InclusionExclusionTextInput from "@common/library/InclusionExclusionTextInput";
import { Button, Card, Container, Flex, LoadingOverlay, MultiSelect, Tabs, Text, Title } from "@mantine/core";
import { useForm } from '@mantine/form';
import { showNotification } from "@mantine/notifications";
import { IconBuilding, IconUsers } from "@tabler/icons";
import { getProspectFilters } from "@utils/requests/getProspectFilters";
import { patchProspectFilters } from "@utils/requests/patchProspectFilters";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";

type PropsType = {
  archetype_id: number,
}


const formOptions = {
  yearsInCurrentCompany: [
    { value: 'Less than a year', label: 'Less than a year' },
    { value: '1 to 2 years', label: '1 to 2 years' },
    { value: '3 to 5 years', label: '3 to 5 years' },
    { value: '5 to 10 years', label: '5 to 10 years' },
    { value: 'More than 10 years', label: 'More than 10 years' },
  ],
  yearsInCurrentPosition: [
    { value: 'Less than a year', label: 'Less than a year' },
    { value: '1 to 2 years', label: '1 to 2 years' },
    { value: '3 to 5 years', label: '3 to 5 years' },
    { value: '5 to 10 years', label: '5 to 10 years' },
    { value: 'More than 10 years', label: 'More than 10 years' },
  ],
  yearsOfExperience: [
    { value: 'Less than a year', label: 'Less than a year' },
    { value: '1 to 2 years', label: '1 to 2 years' },
    { value: '3 to 5 years', label: '3 to 5 years' },
    { value: '5 to 10 years', label: '5 to 10 years' },
    { value: 'More than 10 years', label: 'More than 10 years' },
  ],
  annualRevenue: [
    { value: 'Less than $1M', label: 'Less than $1M' },
    { value: '$1M - $10M', label: '$1M - $10M' },
    { value: '$10M - $50M', label: '$10M - $50M' },
    { value: '$50M - $100M', label: '$50M - $100M' },
    { value: '$100M - $500M', label: '$100M - $500M' },
    { value: '$500M - $1B', label: '$500M - $1B' },
    { value: '$1B - $5B', label: '$1B - $5B' },
    { value: '$5B - $10B', label: '$5B - $10B' },
    { value: '$10B+', label: '$10B+' },
  ],
  headcount: [
    { value: '1-10', label: '1-10' },
    { value: '11 - 50', label: '11 - 50' },
    { value: '51 - 200', label: '51 - 200' },
    { value: '201 - 500', label: '201 - 500' },
    { value: '501 - 1000', label: '501 - 1000' },
    { value: '1001 - 5000', label: '1001 - 5000' },
    { value: '5001 - 10000', label: '5001 - 10000' },
    { value: '10001+', label: '10001+' },
  ]
}


export default function PersonaFilters(props: PropsType) {
  const [userToken] = useRecoilState(userTokenState);
  const [loading, setLoading] = useState(false);

  const leadForm = useForm({
    initialValues: {
      currentCompaniesInclusion: [''],
      currentCompaniesExclusion: [''],
      pastCompaniesInclusion: [''],
      pastCompaniesExclusion: [''],
      currentJobTitleInclusion: [''],
      currentJobTitleExclusion: [''],
      pastJobTitleInclusion: [''],
      pastJobTitleExclusion: [''],
      currentJobFunctionInclusion: [''],
      currentJobFunctionExclusion: [''],
      seniorityInclusion: [''],
      seniorityExclusion: [''],
      geographyInclusion: [''],
      geographyExclusion: [''],
      industryInclusion: [''],
      industryExclusion: [''],
      yearsInCurrentCompany: [''],
      yearsInCurrentPosition: [''],
      yearsOfExperience: [''],
    }
  })

  const accountForm = useForm({
    initialValues: {
      annualRevenue: [''],
      headcount: [''],
      headquarterLocationInclusion: [''],
      headquarterLocationExclusion: [''],
      accountIndustryInclusion: [''],
      accountIndustryExclusion: [''],
    }
  })


  const triggerGetProspectFilters = async () => {
    setLoading(true);

    const response = await getProspectFilters(userToken, props.archetype_id);

    leadForm.setValues({
      currentCompaniesInclusion: response.data.lead.company.current_company_names_inclusion,
      currentCompaniesExclusion: response.data.lead.company.current_company_names_exclusion,
      pastCompaniesInclusion: response.data.lead.company.past_company_names_inclusion,
      pastCompaniesExclusion: response.data.lead.company.past_company_names_exclusion,
      currentJobTitleInclusion: response.data.lead.role.current_job_title_inclusion,
      currentJobTitleExclusion: response.data.lead.role.current_job_title_exclusion,
      pastJobTitleInclusion: response.data.lead.role.past_job_title_inclusion,
      pastJobTitleExclusion: response.data.lead.role.past_job_title_exclusion,
      currentJobFunctionInclusion: response.data.lead.role.current_job_function_inclusion,
      currentJobFunctionExclusion: response.data.lead.role.current_job_function_exclusion,
      seniorityInclusion: response.data.lead.role.seniority_inclusion,
      seniorityExclusion: response.data.lead.role.seniority_exclusion,
      geographyInclusion: response.data.lead.personal.geography_inclusion,
      geographyExclusion: response.data.lead.personal.geography_exclusion,
      industryInclusion: response.data.lead.personal.industry_inclusion,
      industryExclusion: response.data.lead.personal.industry_exclusion,
      yearsInCurrentCompany: response.data.lead.role.years_in_current_company,
      yearsInCurrentPosition: response.data.lead.role.years_in_current_position,
      yearsOfExperience: response.data.lead.personal.years_of_experience,
    })

    if (response.data.lead.company.current_company_names_inclusion.length > 0) {
      console.log('current company inclusion', response.data.lead.company.current_company_names_inclusion)
      console.log('lead form values', leadForm.values.currentCompaniesInclusion)
    }

    accountForm.setValues({
      annualRevenue: response.data.account.annual_revenue,
      headcount: response.data.account.headcount,
      headquarterLocationInclusion: response.data.account.headquarter_location_inclusion,
      headquarterLocationExclusion: response.data.account.headquarter_location_exclusion,
      accountIndustryInclusion: response.data.account.account_industry_inclusion,
      accountIndustryExclusion: response.data.account.account_industry_exclusion,
    })

    setLoading(false);
  }

  const triggerPatchProspectFilters = async () => {
    setLoading(true);

    const response = await patchProspectFilters(
      userToken,
      props.archetype_id,
      leadForm.values.currentCompaniesInclusion,
      leadForm.values.currentCompaniesExclusion,
      leadForm.values.pastCompaniesInclusion,
      leadForm.values.pastCompaniesExclusion,
      leadForm.values.currentJobTitleInclusion,
      leadForm.values.currentJobTitleExclusion,
      leadForm.values.pastJobTitleInclusion,
      leadForm.values.pastJobTitleExclusion,
      leadForm.values.currentJobFunctionInclusion,
      leadForm.values.currentJobFunctionExclusion,
      leadForm.values.seniorityInclusion,
      leadForm.values.seniorityExclusion,
      leadForm.values.geographyInclusion,
      leadForm.values.geographyExclusion,
      leadForm.values.industryInclusion,
      leadForm.values.industryExclusion,
      leadForm.values.yearsInCurrentCompany,
      leadForm.values.yearsInCurrentPosition,
      leadForm.values.yearsOfExperience,
      accountForm.values.annualRevenue,
      accountForm.values.headcount,
      accountForm.values.headquarterLocationInclusion,
      accountForm.values.headquarterLocationExclusion,
      accountForm.values.accountIndustryInclusion,
      accountForm.values.accountIndustryExclusion,
    );

    if (response.status === 'success') {
      showNotification({
        title: 'Success',
        message: 'Persona filters updated successfully',
        color: 'green',
        autoClose: 3000,
      })
    } else {
      showNotification({
        title: 'Error',
        message: 'Something went wrong',
        color: 'red',
        autoClose: 3000,
      })
    }

    setLoading(false);
  }

  useEffect(() => {
    triggerGetProspectFilters();
  }, [])

  return (
    <Flex>
      <Container>
        <Card pos='relative'>
          <LoadingOverlay visible={loading} />
          <Title order={4}>Persona Filters</Title>
          <Text size="sm" mb="md">
            This is where you can specify which filters to apply on your persona, and SellScale will automatically attempt to find the best matches for you. Autofill coming soon!
          </Text>
          <Tabs defaultValue='lead' orientation="vertical">
            <Tabs.List>
              <Tabs.Tab value='lead' icon={<IconUsers size="0.8rem" />}>Lead</Tabs.Tab>
              <Tabs.Tab value='account' icon={<IconBuilding size="0.8rem" />}>Account</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value='lead' pt='xs'>
              <Flex ml='md' direction={'column'}>
                <Title order={5}>Lead Filters</Title>
                <Text size="xs" mb="lg">
                  These filters will be applied to the leads that SellScale helps find for you.
                </Text>

                <Flex mb='sm'>
                  {/* Current companies */}
                  <Flex w='50%'>
                    <InclusionExclusionTextInput
                      label='Current Companies'
                      description='Company that the lead is currently working at.'
                      placeholder='SellScale'
                      onInclusionAdd={(value) => {
                        leadForm.setFieldValue('currentCompaniesInclusion', value)
                      }}
                      onExclusionAdd={(value) => {
                        leadForm.setFieldValue('currentCompaniesExclusion', value)
                      }}
                      defaultInclusion={leadForm.values.currentCompaniesInclusion}
                      defaultExclusion={leadForm.values.currentCompaniesExclusion}
                    />
                  </Flex>

                  {/* Past companies */}
                  <Flex w='50%'>
                    <InclusionExclusionTextInput
                      label='Past Companies'
                      description='Company that the lead has worked at in the past.'
                      placeholder='SellScale'
                      onInclusionAdd={(value) => {
                        leadForm.setFieldValue('pastCompaniesInclusion', value)
                      }}
                      onExclusionAdd={(value) => {
                        leadForm.setFieldValue('pastCompaniesExclusion', value)
                      }}
                      defaultInclusion={leadForm.values.pastCompaniesInclusion}
                      defaultExclusion={leadForm.values.pastCompaniesExclusion}
                    />
                  </Flex>

                </Flex>

                <Flex mb='sm'>
                  {/* Current job title */}
                  <Flex w='50%'>
                    <InclusionExclusionTextInput
                      label='Current Job Title'
                      description='Job title that the lead currently holds.'
                      placeholder='CEO'
                      onInclusionAdd={(value) => {
                        leadForm.setFieldValue('currentJobTitleInclusion', value)
                      }}
                      onExclusionAdd={(value) => {
                        leadForm.setFieldValue('currentJobTitleExclusion', value)
                      }}
                      defaultInclusion={leadForm.values.currentJobTitleInclusion}
                      defaultExclusion={leadForm.values.currentJobTitleExclusion}
                    />
                  </Flex>

                  {/* Past job title */}
                  <Flex w='50%'>
                    <InclusionExclusionTextInput
                      label='Past Job Title'
                      description='Job title that the lead has held in the past.'
                      placeholder='CEO'
                      onInclusionAdd={(value) => {
                        leadForm.setFieldValue('pastJobTitleInclusion', value)
                      }}
                      onExclusionAdd={(value) => {
                        leadForm.setFieldValue('pastJobTitleExclusion', value)
                      }}
                      defaultInclusion={leadForm.values.pastJobTitleInclusion}
                      defaultExclusion={leadForm.values.pastJobTitleExclusion}
                    />
                  </Flex>
                </Flex>

                <Flex mb='sm'>
                  {/* Current job function */}
                  <Flex w='50%'>
                    <InclusionExclusionTextInput
                      label='Current Job Function'
                      description='Job function that the lead performs.'
                      placeholder='Administration'
                      onInclusionAdd={(value) => {
                        leadForm.setFieldValue('currentJobFunctionInclusion', value)
                      }}
                      onExclusionAdd={(value) => {
                        leadForm.setFieldValue('currentJobFunctionExclusion', value)
                      }}
                      defaultInclusion={leadForm.values.currentJobFunctionInclusion}
                      defaultExclusion={leadForm.values.currentJobFunctionExclusion}
                    />
                  </Flex>

                  {/* Seniority */}
                  <Flex w='50%'>
                    <InclusionExclusionTextInput
                      label='Seniority'
                      description='Seniority of the lead.'
                      placeholder='C-Suite'
                      onInclusionAdd={(value) => {
                        leadForm.setFieldValue('seniorityInclusion', value)
                      }}
                      onExclusionAdd={(value) => {
                        leadForm.setFieldValue('seniorityExclusion', value)
                      }}
                      defaultInclusion={leadForm.values.seniorityInclusion}
                      defaultExclusion={leadForm.values.seniorityExclusion}
                    />
                  </Flex>
                </Flex>

                <Flex mb='sm'>
                  {/* Geography */}
                  <Flex w='50%'>
                    <InclusionExclusionTextInput
                      label='Geography'
                      description='Geography of the lead.'
                      placeholder='United States'
                      onInclusionAdd={(value) => {
                        leadForm.setFieldValue('geographyInclusion', value)
                      }}
                      onExclusionAdd={(value) => {
                        leadForm.setFieldValue('geographyExclusion', value)
                      }}
                      defaultInclusion={leadForm.values.geographyInclusion}
                      defaultExclusion={leadForm.values.geographyExclusion}
                    />
                  </Flex>


                  {/* Industry */}
                  <Flex w='50%'>
                    <InclusionExclusionTextInput
                      label='Industry'
                      description='Industry of the lead.'
                      placeholder='Software'
                      onInclusionAdd={(value) => {
                        leadForm.setFieldValue('industryInclusion', value)
                      }}
                      onExclusionAdd={(value) => {
                        leadForm.setFieldValue('industryExclusion', value)
                      }}
                      defaultInclusion={leadForm.values.industryInclusion}
                      defaultExclusion={leadForm.values.industryExclusion}
                    />
                  </Flex>
                </Flex>

                <Flex mb='lg'>
                  {/* Years in current company */}
                  <Flex w='50%'>
                    <MultiSelect
                      w='75%'
                      label='Years in Current Company'
                      placeholder='More than 10 years'
                      data={formOptions.yearsInCurrentCompany}
                      value={leadForm.values.yearsInCurrentCompany}
                      onChange={(value) => {
                        leadForm.setFieldValue('yearsInCurrentCompany', value)
                      }}
                    />
                  </Flex>

                  {/* Years in current position */}
                  <Flex w='50%'>
                    <MultiSelect
                      w='75%'
                      label='Years in Current Position'
                      placeholder='3 to 5 years'
                      data={formOptions.yearsInCurrentPosition}
                      value={leadForm.values.yearsInCurrentPosition}
                      onChange={(value) => {
                        leadForm.setFieldValue('yearsInCurrentPosition', value)
                      }}
                    />
                  </Flex>

                </Flex>

                <Flex mb='lg'>
                  {/* Years of experience */}
                  <Flex mr='xl'>
                    <MultiSelect
                      label='Years of Experience'
                      placeholder='More than 10 years'
                      data={formOptions.yearsOfExperience}
                      value={leadForm.values.yearsOfExperience}
                      onChange={(value) => {
                        leadForm.setFieldValue('yearsOfExperience', value)
                      }}
                    />
                  </Flex>
                </Flex>

                <Flex justify={'right'}>
                  <Button
                    variant='filled'
                    size='sm'
                    w='120px'
                    onClick={triggerPatchProspectFilters}
                  >
                    Save
                  </Button>
                </Flex>
              </Flex>
            </Tabs.Panel>

            <Tabs.Panel value='account' pt='xs'>
              <Flex ml='md' direction={'column'}>
                <Title order={5}>Account Filters</Title>
                <Text size="xs" mb="lg">
                  These filters will be applied to the accounts that SellScale helps find for you.
                </Text>

                <Flex mb='sm'>
                  {/* Annual Revenue */}
                  <Flex w='50%'>
                    <MultiSelect
                      w='75%'
                      label='Annual Revenue'
                      placeholder='Less than $1M'
                      data={formOptions.annualRevenue}
                      value={accountForm.values.annualRevenue}
                      onChange={(value) => {
                        accountForm.setFieldValue('annualRevenue', value)
                      }}
                    />
                  </Flex>

                  {/* Headcount */}
                  <Flex w='50%'>
                    <MultiSelect
                      w='75%'
                      label='Headcount'
                      placeholder='1-10'
                      data={formOptions.headcount}
                      value={accountForm.values.headcount}
                      onChange={(value) => {
                        leadForm.setFieldValue('headcount', value)
                      }}
                    />
                  </Flex>
                </Flex>

                <Flex mb='sm'>
                  {/* Headquarter Location */}
                  <Flex w='50%'>
                    <InclusionExclusionTextInput
                      label='Headquarter Location'
                      description='Location of the company headquarters.'
                      placeholder='San Francisco'
                      onInclusionAdd={(value) => {
                        accountForm.setFieldValue('headquarterLocationInclusion', value)
                      }}
                      onExclusionAdd={(value) => {
                        accountForm.setFieldValue('headquarterLocationExclusion', value)
                      }}
                      defaultInclusion={accountForm.values.headquarterLocationInclusion}
                      defaultExclusion={accountForm.values.headquarterLocationExclusion}
                    />
                  </Flex>

                  {/* Industry */}
                  <Flex w='50%'>
                    <InclusionExclusionTextInput
                      label='Industry'
                      description='Industry of the company.'
                      placeholder='Software'
                      onInclusionAdd={(value) => {
                        accountForm.setFieldValue('accountIndustryInclusion', value)
                      }}
                      onExclusionAdd={(value) => {
                        accountForm.setFieldValue('accountIndustryExclusion', value)
                      }}
                      defaultInclusion={accountForm.values.accountIndustryInclusion}
                      defaultExclusion={accountForm.values.accountIndustryExclusion}
                    />
                  </Flex>
                </Flex>

                <Flex justify={'right'}>
                  <Button
                    variant='filled'
                    size='sm'
                    w='120px'
                    onClick={triggerPatchProspectFilters}
                  >
                    Save
                  </Button>
                </Flex>

              </Flex>
            </Tabs.Panel>

          </Tabs>
        </Card>
      </Container>
    </Flex>
  )
}
