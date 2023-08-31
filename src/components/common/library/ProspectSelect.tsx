import { userTokenState } from "@atoms/userAtoms";
import { createStyles, useMantineTheme, Text, Flex, Badge, Select, Loader, Card } from "@mantine/core";
import { valueToColor } from "@utils/general";
import { getArchetypeProspects } from "@utils/requests/getArchetypeProspects";
import { last } from 'lodash';
import { useState, useEffect, forwardRef } from "react";
import { useRecoilValue } from "recoil";
import { ProspectShallow } from "src";


interface ProspectItemProps extends React.ComponentPropsWithoutRef<'div'> {
  label: string;
  icpFit: number;
  title: string;
  company: string;
}

let icpFitScoreMap = new Map<string, string>([
  ['-3', 'QUEUED'],
  ['-2', 'CALCULATING'],
  ['-1', 'ERROR'],
  ['0', 'VERY LOW'],
  ['1', 'LOW'],
  ['2', 'MEDIUM'],
  ['3', 'HIGH'],
  ['4', 'VERY HIGH'],
]);

export default function ProspectSelect(props: { personaId: number, onChange: (prospect: ProspectShallow | undefined) => void }) {
  
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const [prospects, setProspects] = useState<ProspectShallow[]>([]);
  const [selectedProspect, setSelectedProspect] = useState<ProspectShallow>();
  const [loadingProspects, setLoadingProspects] = useState<boolean>(false);
  const [lastTimeRun, setLastTimeRun] = useState<number>(0);
  const [searchingProspects, setSearchingProspects] = useState<boolean>(false);

  const searchProspects = async (search: string = ' ') => {
    if (lastTimeRun > Date.now() - 1000) {
      console.log('Skipping search');
      return;
    }
    setSearchingProspects(true);
    setLastTimeRun(Date.now());
    const result = await getArchetypeProspects(userToken, props.personaId, search);
      if (result.status === 'success') {
        const prospects = result.data as ProspectShallow[];
          prospects.sort((a, b) => {
            if (a.icp_fit_score === b.icp_fit_score) {
              return a.full_name.localeCompare(b.full_name);
            }
            return b.icp_fit_score - a.icp_fit_score;
          });

        setProspects(prospects);
      }
      setSearchingProspects(false);
  }

  useEffect(() => {
    (async () => {
      setLoadingProspects(true);
      await searchProspects()
      setLoadingProspects(false);
    })();
  }, []);

  const ProspectSelectItem = forwardRef<HTMLDivElement, ProspectItemProps>(
    ({ label, icpFit, title, company, ...others }: ProspectItemProps, ref) => (
      <div ref={ref} {...others}>
        <Flex justify={'space-between'}>
          <Text>{label}</Text>
          {icpFit ? (
            <Badge color={valueToColor(theme, icpFitScoreMap.get(icpFit.toString()) || 'NONE')}>
              {icpFitScoreMap.get(icpFit.toString())}
            </Badge>
          ) : (
            <Badge color={valueToColor(theme, 'NONE')}>NONE</Badge>
          )}
        </Flex>
        <Text fz='xs'>
          {title} @ {company}
        </Text>
      </div>
    )
  );
  
  if (loadingProspects) {
    return <Card><Loader m='auto 0%' /></Card>;
  }
  
  return (
    <Select
      mt='md'
      label='Select a prospect'
      placeholder='Pick one'
      itemComponent={ProspectSelectItem}
      searchable
      clearable
      nothingFound={searchingProspects ? 'Loading prospects ...' : 'No prospects found'}
      value={selectedProspect ? selectedProspect.id + '' : '-1'}
      data={prospects.map((prospect) => {
        return {
          value: prospect.id + '',
          label: prospect.full_name,
          icpFit: prospect.icp_fit_score,
          title: prospect.title,
          company: prospect.company,
        };
      })}
      onInput={
        (e) => {
          searchProspects(e.target.value);
        }
      }
      onChange={(value: string) => {
        searchProspects(value);
        if (!value) {
          setSelectedProspect(undefined);
          props.onChange(undefined);
          return;
        }
        const foundProspect = prospects.find((prospect) => prospect.id === (parseInt(value) || -1));
        setSelectedProspect(foundProspect);
        props.onChange(foundProspect);
      }}
      withinPortal
    />
  );
}
