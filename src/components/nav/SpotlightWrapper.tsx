import { userDataState, userTokenState } from "@atoms/userAtoms";
import { isLoggedIn } from "@auth/core";
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
import {
  SpotlightAction,
  SpotlightActionProps,
  SpotlightProvider,
} from "@mantine/spotlight";
import {
  IconUsers,
  IconHome,
  IconSend,
  IconSearch,
  IconFilter,
  IconAnalyze,
  IconBrandLinkedin,
  IconMail,
  IconCalendar,
  IconSettings,
} from "@tabler/icons";
import { navigateToPage } from "@utils/documentChange";
import { activateQueryPipeline } from "@utils/searchQueryPipeline";
import _ from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const notLoggedIn = !isLoggedIn();

  let mainActions: SpotlightAction[] = [
    {
      title: "Pipeline",
      description: "View your pipeline, daily activity, pending tasks and more",
      group: "Pages",
      onTrigger: () => navigateToPage(navigate, `/overview`),
      icon: <IconFilter size={18} />,
    },
    {
      title: "Inbox",
      description: "View your inbox and send messages",
      group: "Pages",
      onTrigger: () => navigateToPage(navigate, `/inbox`),
      icon: <IconSend size={18} />,
    },
    {
      title: "Campaigns",
      description: "View & create campaigns and analyze results",
      group: "Pages",
      onTrigger: () => navigateToPage(navigate, `/campaigns`),
      icon: <IconCalendar size={18} />,
    },
    {
      title: "Contacts",
      description: "View and manage your contacts",
      group: "Pages",
      onTrigger: () => navigateToPage(navigate, `/contacts/overview`),
      icon: <IconUsers size={18} />,
    },
    {
      title: "AI Brain",
      description: "View and manage your AI Brain strategies and analytics",
      group: "Pages",
      onTrigger: () => navigateToPage(navigate, `/analytics`),
      icon: <IconAnalyze size={18} />,
    },
    {
      title: "Settings",
      description: "View and update your settings",
      group: "Pages",
      onTrigger: () => navigateToPage(navigate, `/settings`),
      icon: <IconSettings size={18} />,
    },
  ];
  if (
    userData &&
    !userData.weekly_li_outbound_target &&
    !userData.weekly_email_outbound_target
  ) {
    mainActions = mainActions.filter((action) => action.title !== "Analytics");
  }

  const userToken = useRecoilValue(userTokenState);

  const currentQuery = useRef("");
  const [query, setQuery] = useDebouncedState("", 400);
  // For queryResult, null = loading and false = failed to find.
  const [queryResult, setQueryResult] = useState<
    SpotlightAction[] | null | false
  >(null);

  useEffect(() => {
    if (query) {
      activateQueryPipeline(query, navigate, theme, userToken).then(
        (result) => {
          if (query === currentQuery.current) {
            setQueryResult(result);
          }
        }
      );
    }
  }, [query]);

  return (
    <SpotlightProvider
      onQueryChange={(query: string) => {
        /* Whenever input changes, this function is called and query is set via setQuery
         * setQuery is a debouncer, after the set debounce time the above useEffect callback is executed.
         * That callback fetches the result data and updates queryResult accordingly.
         */
        setQuery(query.trim());
        currentQuery.current = query.trim();
        if (query.trim() === "") {
          setQueryResult(false);
        } else {
          setQueryResult(null);
        }
      }}
      actions={
        queryResult === null
          ? mainActions
          : queryResult === false || query === ""
          ? mainActions
          : [...queryResult]
      }
      actionComponent={CustomAction}
      searchIcon={<IconSearch size={18} />}
      searchPlaceholder={"Search everywhere..."}
      searchInputProps={{ autoComplete: "off" }}
      shortcut={["mod + K"]}
      limit={30}
      disabled={
        notLoggedIn ||
        ["selix", "selix_onboarding", "signup", "login"].some((path) =>
          window.location.href.includes(path)
        )
      }
      filter={(query: string, actions: SpotlightAction[]) => {
        actions.sort((a, b) => {
          if (a.group === b.group) {
            return a.title.localeCompare(b.title);
          } else {
            return (b.group || "").localeCompare(a.group || "");
          }
        });
        return actions;
      }}
      nothingFoundMessage={
        query !== "" && queryResult !== null ? (
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
