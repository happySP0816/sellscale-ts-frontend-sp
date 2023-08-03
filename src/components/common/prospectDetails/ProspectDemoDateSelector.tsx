import React, { useEffect, useState } from 'react';
import { DatePicker, DatePickerInput, DateTimePicker } from '@mantine/dates';
import { Text, createStyles, rem } from '@mantine/core';
import { API_URL } from '@constants/data';
import { useRecoilState } from 'recoil';
import { userTokenState } from '@atoms/userAtoms';
import displayNotification from '@utils/notificationFlow';

const useStyles = createStyles((theme) => ({
  input: {
    height: rem(54),
    paddingTop: rem(18),
  },

  label: {
    position: 'relative',
    pointerEvents: 'none',
    fontSize: theme.fontSizes.xs,
    top: "28px",
    paddingLeft: theme.spacing.sm,
    zIndex: 1,
  },
}));

export default function ProspectDemoDateSelector(props: { prospectId: number }) {

  const { classes } = useStyles();

  const [userToken] = useRecoilState(userTokenState);
  const [demoDate, setDemoDate] = useState<Date | null>(null);
  const [fetchedDemoDate, setFetchedDemoDate] = useState(false);

  const getProspectDemoDate = async (): Promise<Date | null> => {
    const url = `${API_URL}/prospect/${props.prospectId}/demo_date`;
    return fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json().then((data) => {
            if (data.demo_date) {
              return new Date(data.demo_date);
            }
            return null;
          });
        }
        return null;
      })
      .then((res: any) => {
        setDemoDate(res);
        return res;
      });
  };

  useEffect(() => {
    if (!fetchedDemoDate) {
      getProspectDemoDate();
      setFetchedDemoDate(true);
    }
  }, []);

  const updateProspectDemoDate = async (
    value: any
  ): Promise<{
    status: string;
    title: string;
    message: string;
  }> => {
    return fetch(`${API_URL}/prospect/${props.prospectId}/demo_date`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        demo_date: value,
      }),
    })
      .then((response) => {
        getProspectDemoDate();
        if (response.status === 200) {
          return {
            status: 'success',
            title: 'Demo date updated!',
            message: `Demo date updated to ${value}`,
          };
        }
        return {
          status: 'error',
          title: 'Error while updating demo date',
          message: `Please try again later.`,
        };
      })
      .catch((error) => {
        return {
          status: 'error',
          title: 'Error while updating demo date',
          message: `Please try again later.`,
        };
      });
  };

  return (
    <div>
      <DatePickerInput
        label="Demo Scheduled For"
        placeholder="Select date and time"
        size="xs"
        radius="md"
        dropdownType="modal"
        classNames={classes}
        value={demoDate}
        mt='-24px'
        onChange={async (value) => {
          updateProspectDemoDate(value?.toISOString());
          setDemoDate(new Date(value?.toISOString() || ''));
          /*
          await displayNotification(
            'update-prospect-demo-date',
            () => updateProspectDemoDate(value),
            {
              title: `Updating demo date...`,
              message: `Working with servers...`,
              color: 'teal',
            },
            {
              title: `Demo date updated!`,
              message: `Demo date has been updated successfully.`,
              color: 'teal',
            },
            {
              title: `Error while updating demo date`,
              message: `Please try again later.`,
              color: 'red',
            }
          );
          */
        }}
      />
    </div>
  );
}
