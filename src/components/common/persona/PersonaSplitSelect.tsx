import { forwardRef, useEffect, useState } from "react";
import {
  MultiSelect,
  Box,
  CloseButton,
  Text,
  Badge,
  Grid,
  useMantineTheme,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useRecoilState } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { logout } from "@auth/core";
import { API_URL } from "@constants/data";
import { valueToColor } from "@utils/general";

const countriesData = [
  { label: "United States", value: "US" },
  { label: "Great Britain", value: "GB" },
  { label: "Finland", value: "FI" },
  { label: "France", value: "FR" },
  { label: "Russia", value: "RU" },
];

function Value({ value, active, label, onRemove, classNames, ...others }: any) {
  const theme = useMantineTheme();

  return (
    <div {...others}>
      <Box
        sx={(theme) => ({
          display: "flex",
          cursor: "default",
          alignItems: "center",
          backgroundColor:
            theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
          borderRadius: theme.radius.sm,
        })}
      >
        <CloseButton
          onMouseDown={onRemove}
          variant="transparent"
          size={22}
          iconSize={14}
          tabIndex={-1}
          mr='xs'
        />
        <Badge
          color={active ? "green" : "red"}
          size="xs"
          mr="xs"
          variant="filled"
        />
        <Badge
          color={valueToColor(theme, label)}
          size='xs'
          variant='light'
        >
          {label}
        </Badge>
      </Box>
    </div>
  );
}

const Item = forwardRef(
  (
    {
      name,
      active,
      num_prospects,
      num_unused_li_prospects,
      num_unused_email_prospects,
      percent_unused_li_prospects,
      percent_unused_email_prospects,
      value,
      ...others
    }: any,
    ref
  ) => {
    return (
      <div ref={ref} {...others}>
        <Grid align="center">
          <Grid.Col span={7}>
            <Badge color={active ? "green" : "red"} size="xs" mb="xs">
              {active ? "Active" : "Inactive"}
            </Badge>
            <div>{name}</div>
          </Grid.Col>
          <Grid.Col span={5}>
            <Text size="xs">
              <b>{num_prospects}</b> prospects total
            </Text>
            <Text size="xs">
              <b>{num_unused_li_prospects}</b> available for Linkedin (
              {Math.round(percent_unused_li_prospects * 100)}%)
            </Text>
            <Text size="xs">
              <b>{num_unused_email_prospects}</b> available for Email (
              {Math.round(percent_unused_email_prospects * 100)}%)
            </Text>
          </Grid.Col>
        </Grid>
      </div>
    );
  }
);

type PropsType = {
  disabled: boolean;
  onChange: (archetypes: { archetype_id: number; archetype_name: string; }[]) => void;
  selectMultiple?: boolean;
  label: string;
  description: string;
  defaultValues?: number[];
  exclude?: number[];
};

export default function PersonaSelect({
  disabled,
  onChange,
  selectMultiple,
  label,
  description,
  defaultValues,
  exclude
}: PropsType) {
  const [userToken] = useRecoilState(userTokenState);
  const [selectedValues, setSelectedValues] = useState<string[]>([]); // [1, 2, 3]

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-archetype-details`, {}],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(`${API_URL}/client/archetype/get_details`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      if (response.status === 401) {
        logout();
      }
      const res = await response.json();
      return res;
    },
  });

  let personaOptions = data?.data || [];
  for (let i = 0; i < personaOptions.length; i++) {
    personaOptions[i]["label"] = personaOptions[i].name;
    personaOptions[i]["value"] = personaOptions[i].id.toString();
  }
  if (exclude) {
    personaOptions = personaOptions.filter((x: any) => !exclude.includes(x.id));
  }

  useEffect(() => {
    if (defaultValues) {
      setSelectedValues(defaultValues.map((x) => (x.toString())));
    }
  }, [defaultValues]);

  return (
    <MultiSelect
      zIndex={1000}
      data={personaOptions}
      limit={20}
      valueComponent={Value}
      itemComponent={Item}
      searchable
      required={true}
      value={selectedValues}
      placeholder="select personas..."
      label={label}
      description={description}
      onChange={(ids) => {
        var numVals: any = ids
        var returnVals = []
        for (let val of ids) {
          returnVals.push({
            "archetype_id": parseInt(val),
            "archetype_name": personaOptions.find((x: any) => x.value === val)?.label
          })
        }
        if (!selectMultiple) {
          numVals = numVals.slice(0, 1);
          returnVals = returnVals.slice(0, 1);
        }
        onChange(returnVals);
        setSelectedValues(numVals);
      }}
      disabled={disabled}
      w='100%'
      withinPortal
      styles={{ wrapper: { overflow: 'visible' }, dropdown: { minWidth: 500 } }}
    />
  );
}
