import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import { useEffect, useState } from 'react';
import { getProspectEvents } from '@utils/requests/prospectEvents';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userTokenState } from '@atoms/userAtoms';
import { useMantineTheme } from '@mantine/core';
import { valueToColor } from '@utils/general';
import { navigateToPage } from '@utils/documentChange';
import { useNavigate } from 'react-router-dom';
import { prospectDrawerIdState, prospectDrawerOpenState } from '@atoms/prospectAtoms';

export default function CalendarSection() {

  const userToken = useRecoilValue(userTokenState);
  const theme = useMantineTheme();

  const [_opened, setOpened] = useRecoilState(prospectDrawerOpenState);
  const [_prospectId, setProspectId] = useRecoilState(prospectDrawerIdState);

  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const response = await getProspectEvents(userToken);
      setEvents(response.status === 'success' ? response.data : []);
    })();
  }, []);

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, listPlugin]}
        initialView='dayGridMonth'
        timeZone='UTC'
        headerToolbar={{
          left: 'prev,next',
          center: 'title',
          right: 'dayGridYear,dayGridMonth,dayGridWeek,listWeek'// can switch
        }}
        events={events.map((event) => {
          return {
            id: event.id,
            title: event.title,
            start: new Date(event.start_time),
            end: new Date(event.end_time),
            url: event.meeting_info?.details?.url,
            color: theme.colors[valueToColor(theme, `${event.prospect_id}`)][5],

            // Non-standard Fields
            prospect_id: event.prospect_id,
          }
        })}
        eventClick={(info) => {
          info.jsEvent.preventDefault();

          setProspectId(info.event.extendedProps.prospect_id);
          setOpened(true);
      
          //if (info.event.url) { window.open(info.event.url); }
        }}
      />
    </>
  );
}
