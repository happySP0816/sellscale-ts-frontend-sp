import { nurturingModeState } from "@atoms/inboxAtoms";
import { userTokenState } from "@atoms/userAtoms";
import { Modal, Title, Text, Stack, Select, Checkbox } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { getPersonasOverview } from "@utils/requests/getPersonas";
import _ from "lodash";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { Channel, PersonaOverview } from "src";

export type InboxProspectListFilterState = {
  recentlyContacted: 'ALL' | 'HIDE' | 'SHOW';
  respondedLast: 'ALL' | 'THEM' | 'YOU';
  channel: Channel;
  personaId: string | undefined;
}

export const defaultInboxProspectListFilterState: InboxProspectListFilterState = {
  recentlyContacted: 'ALL',
  respondedLast: 'ALL',
  channel: 'SELLSCALE',
  personaId: undefined,
};

export default function InboxProspectListFilter(props: {
  open: boolean,
  setOpen: (open: boolean) => void
  filters?: InboxProspectListFilterState,
  setFilters: (filters: InboxProspectListFilterState) => void
}) {

  const userToken = useRecoilValue(userTokenState);
  const filterState = useRef<InboxProspectListFilterState>(_.cloneDeep(defaultInboxProspectListFilterState));
  const [nurturingMode, setNurturingMode] = useRecoilState(nurturingModeState);

  useEffect(() => {
    if (props.filters){
      filterState.current = props.filters;
    }
  }, [props.filters]);

  const { data } = useQuery({
    queryKey: [`query-personas-data`],
    queryFn: async () => {
      const response = await getPersonasOverview(userToken);
      return response.status === "success"
          ? (response.data as PersonaOverview[])
          : [];
    },
    refetchOnWindowFocus: false,
  });

  return (
    <Modal
      opened={props.open}
      onClose={() => props.setOpen(false)}
      title={<Title order={4}>Advanced Filters</Title>}
    >
      <Stack>
        <Select
          label='Recently Contacted'
          defaultValue={filterState.current.recentlyContacted}
          data={[
            { value: 'ALL', label: 'Show everyone' },
            { value: 'HIDE', label: 'Hide recently contacted' },
            { value: 'SHOW', label: 'Show only recently contacted' },
          ]}
          onChange={(value) => {
            if (value === 'ALL' || value === 'HIDE' || value === 'SHOW') {
              filterState.current.recentlyContacted = value;
              props.setFilters(filterState.current);
            }
          }}
        />

        <Select
          label='Last Responded'
          defaultValue={filterState.current.respondedLast}
          data={[
            { value: 'ALL', label: 'Either' },
            { value: 'THEM', label: 'Them' },
            { value: 'YOU', label: 'You' },
          ]}
          onChange={(value) => {
            if (value === 'ALL' || value === 'THEM' || value === 'YOU') {
              filterState.current.respondedLast = value;
              props.setFilters(filterState.current);
            }
          }}
        />

        <Select
          label='Channel'
          defaultValue={filterState.current.channel}
          data={[
            { value: 'SELLSCALE', label: 'All' },
            { value: 'LINKEDIN', label: 'LinkedIn' },
            { value: 'EMAIL', label: 'Email' },
          ]}
          onChange={(value) => {
            if (value === 'SELLSCALE' || value === 'LINKEDIN' || value === 'EMAIL') {
              filterState.current.channel = value;
              props.setFilters(filterState.current);
            }
          }}
        />

        <Select
          label='Persona'
          placeholder='Filter by persona'
          defaultValue={filterState.current.personaId}
          searchable
          clearable
          onSearchChange={() => {}}
          searchValue={undefined}
          nothingFound='No persona found'
          data={data ? data.map((persona) => ({ label: persona.name, value: persona.id+'' })) : []}
          onChange={(value) => {
            filterState.current.personaId = value || undefined;
            props.setFilters(filterState.current);
          }}
        />

        <div style={{ paddingTop: 10, paddingBottom: 10 }}>
          <Checkbox
            defaultChecked={nurturingMode}
            label={
              <Text fw={500} fz='xs'>
                Nurturing Mode
              </Text>
            }
            size='xs'
            onChange={(event) => {
              setNurturingMode(event.currentTarget.checked);
            }}
          />
        </div>
      </Stack>
    </Modal>
  );
}
