import { userDataState, userTokenState } from "@atoms/userAtoms";
import {
  Center,
  createStyles,
  Group,
  UnstyledButton,
  Text,
  Badge,
  Loader,
  useMantineTheme,
} from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import { SpotlightAction, SpotlightActionProps, SpotlightProvider } from "@mantine/spotlight";
import { IconUsers, IconHome, IconSend, IconSearch, IconFilter, IconAnalyze, IconBrandLinkedin, IconMail } from "@tabler/icons";
import { navigateToPage } from "@utils/documentChange";
import { activateQueryPipeline } from "@utils/searchQueryPipeline";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";

const useStyles = createStyles((theme) => ({
  action: {
    position: "relative",
    display: "block",
    width: "100%",
    padding: "10px 12px",
    borderRadius: theme.radius.sm,
  },

  actionHovered: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[4]
        : theme.colors.gray[1],
  },
}));

function CustomAction({
  action,
  styles,
  classNames,
  hovered,
  onTrigger,
  ...others
}: SpotlightActionProps) {
  // @ts-ignore
  const { classes, cx } = useStyles(null, {
    styles,
    classNames,
    name: "Spotlight",
  });

  return (
    <UnstyledButton
      className={cx(classes.action, { [classes.actionHovered]: hovered })}
      tabIndex={-1}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onTrigger}
      {...others}
    >
      <Group noWrap>
        {action.icon && <Center>{action.icon}</Center>}

        <div style={{ flex: 1 }}>
          <Text>{action.title}</Text>

          {action.description && (
            <Text color="dimmed" size="xs">
              {action.description}
            </Text>
          )}
        </div>

        {action.badge && (
          <Badge color={action.badgeColor}>{action.badge}</Badge>
        )}
      </Group>
    </UnstyledButton>
  );
}

export default function SpotlightWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const userData = useRecoilValue(userDataState);

  let mainActions: SpotlightAction[] = [
    {
      title: "Home",
      description: "Go to home",
      group: "Pages",
      onTrigger: () => navigateToPage(navigate, `/home`),
      icon: <IconHome size={18} />,
    },
    {
      title: "LinkedIn",
      description: "View your LinkedIn outbound",
      group: "Pages",
      onTrigger: () => navigateToPage(navigate, `/linkedin`),
      icon: <IconBrandLinkedin size={18} />,
    },
    {
      title: 'Email',
      description: 'View your email outbound',
      group: 'Pages',
      onTrigger: () => navigateToPage(navigate, `/email`),
      icon: <IconMail size={18} />,
    },
    {
      title: "Personas",
      description: "Create target ICPs and upload new prospect lists",
      group: "Pages",
      onTrigger: () => navigateToPage(navigate, `/personas`),
      icon: <IconUsers size={18} />,
    },
  ];
  if(userData && !userData.weekly_li_outbound_target && !userData.weekly_email_outbound_target){
    mainActions = mainActions.filter(action => action.title !== 'Analytics');
  }

  const userToken = useRecoilValue(userTokenState);
  const [query, setQuery] = useDebouncedState("", 400);
  // For queryResult, null = loading and false = failed to find.
  const [queryResult, setQueryResult] = useState<
    SpotlightAction[] | null | false
  >(null);

  const [actions, setActions] = useState<SpotlightAction[]>(mainActions);

  // Fix bug with query result not updating the actual displayed results
  useEffect(() => {
    if (queryResult && queryResult.length > 0){
      setActions([...queryResult, ...mainActions]);
    }
  }, [queryResult]);

  return (
    <SpotlightProvider
      onQueryChange={(query: string) => {
        /* Whenever input changes, this function is called and query is set via setQuery
         * setQuery is a debouncer, after the set debounce time the above useEffect callback is executed.
         * That callback fetches the result data and updates queryResult accordingly.
         */
        setQuery(query.trim());
        if (query.trim() === "") {
          setQueryResult(false);
        } else {
          setQueryResult(null);
          activateQueryPipeline(query, navigate, theme, userToken).then((result) => {
            setQueryResult(result);
          });
        }

        if (queryResult) {
          setActions([...queryResult, ...mainActions]);
        } else {
          setActions(mainActions);
        }
      }}
      actions={actions}
      actionComponent={CustomAction}
      searchIcon={<IconSearch size={18} />}
      searchPlaceholder={"Search..."}
      searchInputProps={{ autoComplete: "off" }}
      shortcut={["mod + K"]}
      limit={30}
      nothingFoundMessage={
        query !== "" &&
        (queryResult === false || (queryResult && queryResult.length === 0)) ? (
          <Text c="dimmed" fs="italic">
            Nothing found
          </Text>
        ) : (
          <Loader color="teal" variant="dots" />
        )
      }
    >
      {children}
    </SpotlightProvider>
  );
}
