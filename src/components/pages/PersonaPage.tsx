import { userTokenState } from "@atoms/userAtoms";
import { logout } from "@auth/core";
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
  Button,
  Paper,
  LoadingOverlay,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useQuery } from "react-query";
import { useRecoilState, useRecoilValue } from "recoil";
import { Archetype } from "src/main";
import { SCREEN_SIZES } from "../../constants/data";
import PageFrame from "../common/PageFrame";
import PersonaCard from "../common/persona/PersonaCard";
import LinkedInCTAsDrawer from "../drawers/LinkedInCTAsDrawer";
import PersonaUploadDrawer from "../drawers/PersonaUploadDrawer";

export default function PersonaPage() {

  const userToken = useRecoilValue(userTokenState);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [
      `query-personas-data`
    ],
    queryFn: async () => {

      const response = await fetch(
        `${process.env.REACT_APP_API_URI}/client/archetype/get_archetypes`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      if (response.status === 401) {
        logout();
      }
      const res = await response.json();
      if (!res || !res.archetypes) {
        return [];
      }

      return res.archetypes as Archetype[];
    },
    refetchOnWindowFocus: false,
  });

  console.log(data);

  return (
    <>
      <PageFrame>
        <Paper withBorder p="md" radius="md">
          <LoadingOverlay visible={isFetching} overlayBlur={2} />
          {data?.map(
            (persona) => (
              <PersonaCard
                key={persona.id}
                value={persona.archetype}
                name={persona.archetype}
                active={persona.active}
              />
            )
          )}
        </Paper>
      </PageFrame>
      <LinkedInCTAsDrawer />
      <PersonaUploadDrawer />
    </>
  );
}
