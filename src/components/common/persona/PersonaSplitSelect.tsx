import { forwardRef, useEffect } from "react";
import {
  MultiSelect,
  Box,
  CloseButton,
  SelectItemProps,
  Text,
  Badge,
  Grid,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useRecoilState } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { logout } from "@auth/core";
import { API_URL } from "@constants/data";

const countriesData = [
  { label: "United States", value: "US" },
  { label: "Great Britain", value: "GB" },
  { label: "Finland", value: "FI" },
  { label: "France", value: "FR" },
  { label: "Russia", value: "RU" },
];

function Value({ value, label, onRemove, classNames, ...others }: any) {
  return (
    <div {...others}>
      <Box
        sx={(theme) => ({
          display: "flex",
          cursor: "default",
          alignItems: "center",
          backgroundColor:
            theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,

          paddingLeft: theme.spacing.xs,
          borderRadius: theme.radius.sm,
        })}
      >
        <Box sx={{ lineHeight: 1 }}>{label}</Box>
        <CloseButton
          onMouseDown={onRemove}
          variant="transparent"
          size={22}
          iconSize={14}
          tabIndex={-1}
        />
      </Box>
    </div>
  );
}

const Item = forwardRef<HTMLDivElement, SelectItemProps>(
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
    },
    ref
  ) => {
    return (
      <div ref={ref} {...others}>
        <Grid align="center">
          <Grid.Col span={1}>
            <Badge color={active ? "green" : "red"} size="xs">
              {active ? "Active" : "Inactive"}
            </Badge>
          </Grid.Col>
          <Grid.Col span={6}>
            <div>{name}</div>
          </Grid.Col>
          <Grid.Col span={5}>
            <Text size="xs">
              <b>{num_prospects}</b> prospects total
            </Text>
            <Text size="xs">
              <b>{num_unused_li_prospects}</b> available Linkedin prospects (
              {Math.round(percent_unused_li_prospects * 100)}%)
            </Text>
            <Text size="xs">
              <b>{num_unused_email_prospects}</b> available Email prospects (
              {Math.round(percent_unused_email_prospects * 100)}%)
            </Text>
          </Grid.Col>
        </Grid>
      </div>
    );
  }
);

export default function PersonaSplitSelect() {
  const [userToken] = useRecoilState(userTokenState);
  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-archetype-details`, {}],
    queryFn: async ({ queryKey }) => {
      console.log("GOT HERE");

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

  const personaOptions = data?.data || [];
  for (let i = 0; i < personaOptions.length; i++) {
    personaOptions[i]["label"] = personaOptions[i].name;
    personaOptions[i]["value"] = personaOptions[i].id;
  }
  console.log(personaOptions);

  return (
    <MultiSelect
      data={personaOptions}
      limit={20}
      valueComponent={Value}
      itemComponent={Item}
      searchable
      defaultValue={["US", "FI"]}
      required={true}
      placeholder="none selected ..."
      label="Select persona to split into"
      description="SellScale will use AI to split your prospects into these personas"
    />
  );
}
