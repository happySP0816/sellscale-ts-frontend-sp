import { userTokenState } from "@atoms/userAtoms";
import { Center, createStyles, Group, UnstyledButton, Text, Badge, Loader, useMantineTheme } from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import { SpotlightAction, SpotlightActionProps, SpotlightProvider } from "@mantine/spotlight";
import { IconAffiliate, IconHome, IconInbox, IconSearch, IconSpeakerphone, IconAssembly, IconTrendingDown } from "@tabler/icons";
import { activateQueryPipeline } from "@utils/searchQueryPipeline";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";

const useStyles = createStyles((theme) => ({
  action: {
    position: 'relative',
    display: 'block',
    width: '100%',
    padding: '10px 12px',
    borderRadius: theme.radius.sm,
  },

  actionHovered: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[1],
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
  const { classes, cx } = useStyles(null, { styles, classNames, name: 'Spotlight' });

  return (
    <UnstyledButton
      className={cx(classes.action, { [classes.actionHovered]: hovered })}
      tabIndex={-1}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onTrigger}
      {...others}
    >
      <Group noWrap>
        {action.icon && (
          <Center>
            {action.icon}
          </Center>
        )}

        <div style={{ flex: 1 }}>
          <Text>{action.title}</Text>

          {action.description && (
            <Text color="dimmed" size="xs">
              {action.description}
            </Text>
          )}
        </div>

        {action.badge && <Badge color={action.badgeColor}>{action.badge}</Badge>}
      </Group>
    </UnstyledButton>
  );
}

export default function SpotlightWrapper({ children }: { children: React.ReactNode }) {

  const navigate = useNavigate();
  const theme = useMantineTheme();

  const mainActions: SpotlightAction[] = [
    {
      title: 'Home',
      description: 'Go to home page',
      group: 'Pages',
      onTrigger: () => navigate(`/home`),
      icon: <IconHome size={18} />,
    },
    {
      title: 'Pipeline',
      description: 'View the state of your outbound funnel by stage',
      group: 'Pages',
      onTrigger: () => navigate(`/pipeline`),
      icon: <IconInbox size={18} />,
    },
    {
      title: 'Personas',
      description: 'Create target ICPs and upload new prospect lists',
      group: 'Pages',
      onTrigger: () => navigate(`/personas`),
      icon: <IconAffiliate size={18} />,
    },
    {
      title: 'Campaigns',
      description: 'View and understand the performance of your weekly outbound campaigns',
      group: 'Pages',
      onTrigger: () => navigate(`/campaigns`),
      icon: <IconAssembly size={18} />,
    },
  ];

  const userToken = useRecoilValue(userTokenState);
  const [query, setQuery] = useDebouncedState('', 400);
  // For queryResult, null = loading and false = failed to find.
  const [queryResult, setQueryResult] = useState<SpotlightAction[] | null | false>(null);

  useEffect(() => {
    if (query === '') {
      setQueryResult(false);
      return;
    }
    setQueryResult(null);
    activateQueryPipeline(query, navigate, theme, userToken).then((result) => {
      setQueryResult(result);
    });
  }, [query]);

  return (
    <SpotlightProvider
          actions={(query: string) => {
            /* Whenever input changes, this function is called and query is set via setQuery
             * setQuery is a debouncer, after the set debounce time the above useEffect callback is executed.
             * That callback fetches the result data and updates queryResult accordingly.
             */
            setQuery(query.trim());
            if (queryResult) {
              return [...queryResult, ...mainActions];
            } else {
              return mainActions;
            }
          }}
          actionComponent={CustomAction}
          searchIcon={<IconSearch size={18} />}
          searchPlaceholder={"Search..."}
          searchInputProps={{ autoComplete: "off" }}
          shortcut={["mod + K"]}
          limit={30}
          nothingFoundMessage={
            query !== '' && (queryResult === false || (queryResult && queryResult.length === 0)) ?
            (<Text c="dimmed" fs="italic">Nothing found</Text>)
            :
            (<Loader color="teal" variant="dots" />)
          }
        >
      {children}
    </SpotlightProvider>
  );

}
