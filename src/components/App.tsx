import { useEffect, useState } from 'react';

import {
  MantineProvider,
  ColorSchemeProvider,
  ColorScheme,
  LoadingOverlay,
} from '@mantine/core';

import Layout from './Layout';
import { SpotlightAction, SpotlightProvider } from '@mantine/spotlight';
import { IconSearch } from '@tabler/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import { ModalsProvider } from '@mantine/modals';
import { useQuery, useQueryClient } from 'react-query';
import { NotificationsProvider } from '@mantine/notifications';
import { isLoggedIn } from '@auth/core';
import { useRecoilState } from 'recoil';
import { userEmailState, userNameState, userTokenState } from '@atoms/userAtoms';

export default function App() {

  /* For if we want to support light mode & dark mode:
  // Site light or dark mode
  const isSystemDarkMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const savedSiteTheme = localStorage.getItem('site-theme');
  const currentColorScheme: ColorScheme = (savedSiteTheme != null) ?
    ((savedSiteTheme === 'dark') ? 'dark' : 'light') :
    ((isSystemDarkMode) ? 'dark' : 'light');

  const [colorScheme, setColorScheme] = useState<ColorScheme>(currentColorScheme);
  const toggleColorScheme = (value?: ColorScheme) => {
    let nextColorScheme = value || (colorScheme === 'dark' ? 'light' : 'dark');
    setColorScheme(nextColorScheme);
    localStorage.setItem('site-theme', nextColorScheme);
  };
  */

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [userEmail, setUserEmail] = useRecoilState(userEmailState);
  const [userName, setUserName] = useRecoilState(userNameState);
  const [userToken, setUserToken] = useRecoilState(userTokenState);

  const mainActions: SpotlightAction[] = [];

  // When page is loading, sync user info with local storage info
  const infoResult = useQuery({
    queryKey: ['sync-user-info'],
    queryFn: async () => {
      if (userToken) { return ''; }

      const syncLogin = async () => {

        if(isLoggedIn()){

          setUserEmail(localStorage.getItem('user-email')+'');
          setUserName(localStorage.getItem('user-name')+'');
          setUserToken(localStorage.getItem('user-token')+'');

        } else {

          // Not logged in, should redirect to login page
          console.log('Not logged in');

        }

      }

      await syncLogin();
      return '';

    }
  });
  
  return (
      <ColorSchemeProvider colorScheme={'dark'} toggleColorScheme={() => {}}>
        <MantineProvider theme={{ colorScheme: 'dark', colors: {
          'scale-green': ['#75FF00', '#75FA00', '#75FA00', '#60CD00', '#60CD00', '#60CD00', '#52AF00', '#52AF00', '#52AF00', '#52AF00'],
          'scale-pink': ['#EA5CF6', '#EA5CF6', '#EA5CF6', '#EA5CF6', '#EA5CF6', '#EA5CF6', '#EA5CF6', '#EA5CF6', '#EA5CF6', '#EA5CF6'],
        } }} withGlobalStyles withNormalizeCSS>
          <SpotlightProvider
            actions={(query: string) => {
              return mainActions;
            }}
            searchIcon={<IconSearch size={18} />}
            searchPlaceholder={'Search'}
            searchInputProps={{ autoComplete: 'off' }}
            shortcut={['mod + K']}
            highlightQuery
            nothingFoundMessage={true ? `Nothing found` : `Loading...`}
          >
            <ModalsProvider modals={{
              
            }}>
              <NotificationsProvider position='top-right'>
                <LoadingOverlay visible={infoResult.isLoading} overlayBlur={4} />
                <Layout>
                  {/* Outlet is where react-router will render child routes */}
                  <Outlet />
                </Layout>
              </NotificationsProvider>
            </ModalsProvider>
          </SpotlightProvider>
        </MantineProvider>
      </ColorSchemeProvider>

  );
}
