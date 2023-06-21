import { userTokenState } from "@atoms/userAtoms";
import { createStyles, useMantineTheme, Text, Flex, Badge, Select } from "@mantine/core";
import { valueToColor } from "@utils/general";
import { getArchetypeProspects } from "@utils/requests/getArchetypeProspects";
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

const useStyles = createStyles((theme) => ({
  icon: {
    color: theme.colors.gray[6],
  },
}));

export default function ProspectSelect(props: { personaId: number, onChange: (prospect: ProspectShallow | undefined) => void }) {
  
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const userToken = useRecoilValue(userTokenState);
  const [prospects, setProspects] = useState<ProspectShallow[]>([]);
  const [selectedProspect, setSelectedProspect] = useState<ProspectShallow>();

  const [loading, setLoading] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<{ subject: string; body: string } | null>(null);

  useEffect(() => {
    (async () => {
      const result = await getArchetypeProspects(userToken, props.personaId);
      if (result.status === 'success') {
        setProspects(result.data);
      }
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
  
  return (
    <Select
      mt='md'
      label='Select a prospect'
      placeholder='Pick one'
      itemComponent={ProspectSelectItem}
      searchable
      clearable
      nothingFound='No prospects found'
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
      onChange={(value) => {
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
