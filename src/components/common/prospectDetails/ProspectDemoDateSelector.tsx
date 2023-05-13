import React, { useEffect, useState } from 'react';
import { DatePicker } from '@mantine/dates';
import { Text } from '@mantine/core';
import { API_URL } from '@constants/data';
import { useRecoilState } from 'recoil';
import { userTokenState } from '@atoms/userAtoms';
import displayNotification from '@utils/notificationFlow';

type PropsType = {
  prospectId: number;
};

export default function ProspectDemoDateSelector(props: PropsType) {
  const [userToken] = useRecoilState(userTokenState);
  const [demoDate, setDemoDate] = useState(null);
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
    const url = `${API_URL}/prospect/${props.prospectId}/demo_date`;
    const data = {
      demo_date: value,
    };
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify(data),
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
      <Text>When is this demo scheduled for?</Text>
      <DatePicker
        placeholder='Select date'
        value={demoDate}
        onChange={async (value) => {
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
        }}
        mt={'md'}
      />
    </div>
  );
}
