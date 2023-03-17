import { userTokenState } from "@atoms/userAtoms";
import { logout } from "@auth/core";
import FlexSeparate from "@common/library/FlexSeparate";
import PersonaDetailsDrawer from "@drawers/PersonaDetailsDrawer";
import UploadDetailsDrawer from "@drawers/UploadDetailsDrawer";
import {
  List,
  ThemeIcon,
  Text,
  Container,
  Stack,
  Flex,
  Title,
  useMantineTheme,
  Drawer,
  Group,
  Divider,
  Paper,
  LoadingOverlay,
  Button,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { openContextModal } from "@mantine/modals";
import PageTitle from "@nav/PageTitle";
import { IconUserPlus } from "@tabler/icons";
import { setPageTitle } from "@utils/documentChange";
import getPersonas, { getAllUploads } from "@utils/requests/getPersonas";
import { useQuery } from "react-query";
import { useRecoilState, useRecoilValue } from "recoil";
import { Archetype } from "src/main";
import { SCREEN_SIZES } from "../../constants/data";
import PageFrame from "../common/PageFrame";
import PersonaCard from "../common/persona/PersonaCard";
import PersonaUploadDrawer from "../drawers/PersonaUploadDrawer";

export default function PersonaPage() {
  setPageTitle(`Personas`);

  const userToken = useRecoilValue(userTokenState);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [
      `query-personas-data`
    ],
    queryFn: async () => {

      const response = await getPersonas(userToken);
      const result = response.status === 'success' ? response.extra as Archetype[] : [];

      for(let persona of result) {
        const uploadsResponse = await getAllUploads(userToken, persona.id);
        persona.uploads = uploadsResponse.status === 'success' ? uploadsResponse.extra : [];
      }

      // Sort by number of prospects
      return result.sort((a, b) => {
        return b.performance.total_prospects - a.performance.total_prospects;
      });
    },
    refetchOnWindowFocus: false,
  });

  return (
    <>
      <PageFrame>
          <LoadingOverlay visible={isFetching} overlayBlur={2} />
          <FlexSeparate alignItems="flex-end">
            <PageTitle title='Personas' mb={false} />
            <Button mx='sm' rightIcon={<IconUserPlus size='1rem' />} variant="outline" radius="lg" color="teal" size="xs"
              onClick={() => {
                openContextModal({
                  modal: 'uploadProspects',
                  title: (<Title order={3}>Create Persona</Title>),
                  innerProps: { mode: 'CREATE-ONLY' },
                });
              }}
            >
              Create New Persona
            </Button>
          </FlexSeparate>
          {data?.filter((p) => p.active).map(
            (persona) => (
              <PersonaCard
                key={persona.id}
                archetype={persona}
                refetch={refetch}
                isOpen={data.filter((p) => p.active).length === 1 ? true : undefined}
              />
            )
          )}
          {data?.filter((p) => !p.active).map(
            (persona) => (
              <PersonaCard
                key={persona.id}
                archetype={persona}
                refetch={refetch}
              />
            )
          )}
      </PageFrame>
      <PersonaDetailsDrawer personas={data} />
      <PersonaUploadDrawer personas={data} />
      <UploadDetailsDrawer />
    </>
  );
}
