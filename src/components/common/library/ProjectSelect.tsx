import { currentProjectState } from "@atoms/personaAtoms";
import { userTokenState } from "@atoms/userAtoms";
import { getCurrentPersonaId, isLoggedIn } from "@auth/core";
import {
  Button,
  Menu,
  Title,
  Text,
  createStyles,
  useMantineTheme,
  Flex,
  Group,
} from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import {
  IconCircle,
  IconCircleCheck,
  IconGridDots,
  IconLayoutSidebar,
  IconQuestionCircle,
  IconStack,
} from "@tabler/icons";
import {
  IconSquareCheck,
  IconPackage,
  IconUsers,
  IconCalendar,
  IconChevronDown,
  IconCircleFilled,
  IconCircleDashed,
  IconPlus,
  IconStack3,
  IconCircle4Filled,
  IconX,
} from "@tabler/icons-react";
import { navigateToPage } from "@utils/documentChange";
import { getPersonasOverview } from "@utils/requests/getPersonas";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { PersonaOverview } from "src";

const useStyles = createStyles((theme) => ({
  select: {
    backgroundColor: theme.fn.lighten(
      theme.fn.variant({ variant: "filled", color: "blue" }).background!,
      0.15
    ),
    color: theme.white,
    fontWeight: 700,

    "&:hover": {
      backgroundColor: theme.fn.lighten(
        theme.fn.variant({ variant: "filled", color: "blue" }).background!,
        0.18
      ),
    },
  },
}));

export function ProjectSelect(props: { allOnNone?: boolean, onClick?: (persona: PersonaOverview) => void, disableSelectDefaultProject?: boolean, extraBig?: boolean }) {
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const navigate = useNavigate();

  const userToken = useRecoilValue(userTokenState);
  const [projects, setProjects] = useState<PersonaOverview[]>([]);
  const [currentProject, setCurrentProject] =
    useRecoilState(currentProjectState);

  useEffect(() => {
    (async () => {
      if (!isLoggedIn()) return;
      const response = await getPersonasOverview(userToken);
      const result =
        response.status === "success"
          ? (response.data as PersonaOverview[])
          : [];
      
      if (!props.disableSelectDefaultProject){
        return
      }

      setProjects(result);

      const currentPersonaId = getCurrentPersonaId();
      let activeProject = null;
      if (currentPersonaId) {
        activeProject = result.find((project) => project.id === +currentPersonaId);
      }
      if (!activeProject){
        activeProject = result.find((project) => project.active);
      }
      if (!activeProject){
        activeProject = null;
      }

      if(window.location.href.includes("/all")){
        setCurrentProject(null);
      } else {
        setCurrentProject(activeProject);
      }
    })();
  }, []);

  return (
    <Flex direction='row'>
      <Button
        variant='outline'
        leftIcon={<IconLayoutSidebar size="1.05rem" stroke={1.5} />}
        rightIcon={<IconChevronDown size="1.05rem" stroke={1.5} />}
        maw={'400px'}
        w='85%'
        ml='xs'
        mr='xs'
        mt='xs'
        fz={props.extraBig ? '20px' : 'xs'}
        size={props.extraBig ? 'lg' : 'xs'}
        onClick={() => {
          openContextModal({
            modal: "personaSelect",
            title: (
              <Flex w="100%" pr="6px">
                <Flex dir="row" justify="space-between" align={"center"} w="100%">
                  <Title order={3}>Your Personas</Title>
                  <Group>
                    <Button
                      variant="subtle"
                      compact
                      onClick={() => {
                        openContextModal({
                          modal: "uploadProspects",
                          title: <Title order={3}>Create Persona</Title>,
                          innerProps: { mode: "CREATE-ONLY" },
                        });
                      }}
                    >
                      New Persona
                    </Button>
                  </Group>
                </Flex>
              </Flex>
            ),
            innerProps: {
              onClick: (persona: PersonaOverview) => {
                props.onClick && props.onClick(persona);
              },
            },
            styles: { title: { width: "100%" } },
          });
        }}
      >
        {currentProject?.name || (props.allOnNone ? "All Personas" : "Select Persona")}
      </Button>

      <Button color='blue' size='xs' variant='subtle' mt='xs'
        onClick={
          () => {
            setCurrentProject(null);
          }
        }>
        <IconX size='0.8rem' />
      </Button>
    </Flex>
  );
}
