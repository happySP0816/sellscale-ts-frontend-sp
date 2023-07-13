import { currentProjectState } from "@atoms/personaAtoms";
import { userTokenState } from "@atoms/userAtoms";
import { isLoggedIn } from "@auth/core";
import {
  Button,
  Menu,
  Title,
  Text,
  createStyles,
  useMantineTheme,
} from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import { IconCircle, IconCircleCheck, IconGridDots, IconLayoutSidebar, IconQuestionCircle, IconStack } from '@tabler/icons';
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
      theme.fn.variant({ variant: "filled", color: "dark" }).background!,
      0.15
    ),
    color: theme.white,
    fontWeight: 700,

    "&:hover": {
      backgroundColor: theme.fn.lighten(
        theme.fn.variant({ variant: "filled", color: "dark" }).background!,
        0.18
      ),
    },
  },
}));

export function ProjectSelect() {
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const navigate = useNavigate();

  const userToken = useRecoilValue(userTokenState);
  const [projects, setProjects] = useState<PersonaOverview[]>([]);
  const [currentProject, setCurrentProject] =
    useRecoilState(currentProjectState);

  useEffect(() => {
    (async () => {
      if(!isLoggedIn()) return;
      const response = await getPersonasOverview(userToken);
      const result =
        response.status === "success"
          ? (response.data as PersonaOverview[])
          : [];
      setProjects(result);

      const firstActiveProject = result.find((project) => project.active);
      if (firstActiveProject && !window.location.href.includes("/all") ) setCurrentProject(firstActiveProject);

    })();
  }, []);

  return (
    <Menu
      transitionProps={{ transition: "pop-top-left" }}
      position="top-start"
      width={250}
      withinPortal
      withArrow
    >
      <Menu.Target>
        <Button
          size="sm"
          sx={{backgroundColor: currentProject?.id ? '#4298f5' : ''}}
          className={classes.select}
          leftIcon={<IconLayoutSidebar size="1.05rem" stroke={1.5} />}
          rightIcon={<IconChevronDown size="1.05rem" stroke={1.5} />}
          pr={12}
          w={250}
        >
          {currentProject?.name || "Select Persona"}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        {projects.map((project, i) => (
          <Menu.Item
            opacity={project.id === currentProject?.id ? 0.5 : 1}
            key={i}
            disabled={project.id === currentProject?.id}
            icon={project.active ? (
              <IconCircleCheck
                size="1rem"
                color='green'
                stroke={1.5}
              />
            ) : project.is_unassigned_contact_archetype ? (
              <IconStack3
                size="1rem"
                color='blue'
                stroke={1.5}
              />
            ) : (
              <IconCircleDashed
                size="1rem"
                color='red'
                stroke={1.5}
              />
            )}
            onClick={() => {
              setCurrentProject(project);
              navigateToPage(navigate, `/inbox`);
            }}
          >
            {project.name}
          </Menu.Item>
        ))}
        <Menu.Divider />
        <Menu.Item icon={<IconPlus size={14} />}
          onClick={() => {
            openContextModal({
              modal: "uploadProspects",
              title: <Title order={3}>Create Persona</Title>,
              innerProps: { mode: "CREATE-ONLY" },
            });
          }}
        >Create New Persona</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
