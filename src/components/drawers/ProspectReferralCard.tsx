import { prospectDrawerOpenState, prospectDrawerIdState } from "@atoms/prospectAtoms";
import { Paper, ThemeIcon, Text, Anchor } from "@mantine/core";
import { IconUsers } from "@tabler/icons";
import { useRecoilState } from "recoil";

export default function ProspectReferralCard(props: { referredBy?: boolean, prospects: { id: number, full_name: string }[] }) {

  const [_opened, setDrawerOpened] = useRecoilState(prospectDrawerOpenState);
  const [_prospectId, setProspectId] = useRecoilState(prospectDrawerIdState);

  return (
    <Paper shadow="xs" my='sm' withBorder w={320} sx={{ position: 'relative' }}>
      <ThemeIcon size={30} variant="default" sx={{ position: 'absolute', left: 0, }}>
        <IconUsers />
      </ThemeIcon>
      <Text fz='sm' p={4} pl={40}>
        {props.referredBy ? 'Referred to by ' : 'Referred '}
        {props.prospects.map((prospect, index) => (
          <span key={index}>
            <Anchor
              component="button"
              type="button"
              onClick={() => {
                setDrawerOpened(false);
                setTimeout(() => {
                  setProspectId(prospect.id);
                  setDrawerOpened(true);
                }, 50);
              }}
            >
              {prospect.full_name}
            </Anchor>
            {props.prospects[index+1] ? ', ' : ''}
          </span>
        ))}
      </Text>
    </Paper>
  )

}

