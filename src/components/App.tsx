import { useEffect, useState } from 'react';

import {
  MantineProvider,
  ColorSchemeProvider,
  ColorScheme,
  LoadingOverlay,
} from '@mantine/core';

import Layout from './Layout';
import { SpotlightAction, SpotlightProvider } from '@mantine/spotlight';
import { IconSearch, IconTrendingDown, IconTrendingUp } from '@tabler/icons';
import { User, UserContext } from '../contexts/user';
import { Outlet, useNavigate } from 'react-router-dom';
import { ModalsProvider } from '@mantine/modals';
import { useQuery, useQueryClient } from 'react-query';
import updateTokens from '../utils/updateTokens';
import { useDebouncedState } from '@mantine/hooks';
import { NotificationsProvider } from '@mantine/notifications';

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
  const [user, setUser] = useState({
    localId: '',
  });


  const mainActions: SpotlightAction[] = [];

  // When page is loading, fetch user info from accessToken
  const infoResult = useQuery({
    queryKey: ['get-info'],
    queryFn: async () => {
      if (user.localId) { return ''; }

      const getInfo = async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) { return; }

        console.log('Retrieving profile info...');

        // Make request to backend to get info (see: api/auth/info.py)
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/info`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        const res = await response.json();

        switch (res.message) {
          case 'INVALID_ID_TOKEN':
            console.log('Invalid access token.')
            let success = await updateTokens();
            if (success) {
              console.log('Updated access token, attempting info retrieval again...')
              await getInfo();
            }
            return;
          case '':
            console.log('Successfully found info.')
            setUser({
              localId: res.data.localId,
            });
            return;
          default:
            return;
        }
      }

      await getInfo();
      return '';

    }
  });
  
  return (

    <UserContext.Provider value={{ user, setUser: (u: User) => { setUser(u) } }}>
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
    </UserContext.Provider>

  );
}
