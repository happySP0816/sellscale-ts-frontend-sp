import { Button, Drawer, Group, Title } from '@mantine/core';
import { useRecoilState, useRecoilValue } from 'recoil';
import Filters from '@common/persona/ICPFilter/Filters';
import { filterDrawerOpenState, filterRuleSetState } from '@atoms/icpFilterAtoms';
import { IconSearch } from '@tabler/icons';
import { useQueryClient } from '@tanstack/react-query';
import { updateICPRuleSet } from '@utils/requests/icpScoring';
import { useEffect } from 'react';
import { userTokenState } from '@atoms/userAtoms';
import { currentProjectState } from '@atoms/personaAtoms';
import { update } from 'lodash';

export default function PersonFilterDrawer(props: { onClickSearch?: () => void }) {
  const [opened, setOpened] = useRecoilState(filterDrawerOpenState);
  const queryClient = useQueryClient();

  const globalRuleSetData = useRecoilValue(filterRuleSetState);
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);

  const updateFilters = async () => {
    if (!currentProject) return;
    const response = await updateICPRuleSet(
      userToken,
      currentProject.id,
      globalRuleSetData.included_individual_title_keywords,
      globalRuleSetData.excluded_individual_title_keywords,
      globalRuleSetData.included_individual_industry_keywords,
      globalRuleSetData.individual_years_of_experience_start,
      globalRuleSetData.individual_years_of_experience_end,
      globalRuleSetData.included_individual_skills_keywords,
      globalRuleSetData.excluded_individual_skills_keywords,
      globalRuleSetData.included_individual_locations_keywords,
      globalRuleSetData.excluded_individual_locations_keywords,
      globalRuleSetData.included_individual_generalized_keywords,
      globalRuleSetData.excluded_individual_generalized_keywords,
      globalRuleSetData.included_company_name_keywords,
      globalRuleSetData.excluded_company_name_keywords,
      globalRuleSetData.included_company_locations_keywords,
      globalRuleSetData.excluded_company_locations_keywords,
      globalRuleSetData.company_size_start,
      globalRuleSetData.company_size_end,
      globalRuleSetData.included_company_industries_keywords,
      globalRuleSetData.excluded_company_industries_keywords,
      globalRuleSetData.included_company_generalized_keywords,
      globalRuleSetData.excluded_company_generalized_keywords,
      globalRuleSetData.included_individual_education_keywords,
      globalRuleSetData.excluded_individual_education_keywords,
    );
  };

  return (
    <Drawer
      opened={opened}
      onClose={() => setOpened(false)}
      title={
        <Group>
          <Title order={3}>Filters</Title>
          <Button
            rightIcon={<IconSearch size='1rem' stroke='3' />}
            radius='lg'
            size='md'
            compact
            onClick={() => {
              props.onClickSearch && props.onClickSearch();
              setOpened(false);
              updateFilters();
              queryClient.refetchQueries({
                queryKey: [`query-get-individuals`],
              });
            }}
          >
            Search
          </Button>
        </Group>
      }
      padding='xl'
      size='xs'
      position='right'
    >
      <Filters isTesting={false} selectOptions={[]} autofill={false} />
    </Drawer>
  );
}
