import {
  Paper,
  Title,
  Text,
  MultiSelect,
  Box,
  rem,
  MultiSelectValueProps,
  Badge,
  CloseButton,
  Divider,
  Flex,
} from "@mantine/core";
import { IconChevronDown } from "@tabler/icons";
import React, { useState } from "react";
import BarChart from "./ProspectFit/BarChart";
function Value({
  value,
  label,
  onRemove,
  classNames,
  ...others
}: MultiSelectValueProps & { value: string }) {
  return (
    <div {...others}>
      <Box
        sx={(theme) => ({
          display: "flex",
          cursor: "default",
          alignItems: "center",
          backgroundColor: theme.colors.green[1],
          border: `${rem(1)} solid ${theme.colors.green[4]}`,
          paddingLeft: theme.spacing.xs,
          borderRadius: theme.radius.sm,
        })}
      >
        <Box sx={{ lineHeight: 1, fontSize: rem(12), fontWeight: 500 }}>
          {label}
        </Box>
        <CloseButton
          onMouseDown={onRemove}
          variant="transparent"
          color="green.8"
          size={22}
          iconSize={14}
          tabIndex={-1}
        />
      </Box>
    </div>
  );
}
const ProspectFit = () => {
  const [data, setData] = useState([
    { value: "react", label: "React" },
    { value: "ng", label: "Angular" },
  ]);
  return (
    <Paper mt={"lg"} p={"lg"} radius={"lg"}>
      <Title order={2}>Prospect Fit - Coming Soon ⚠️</Title>
      <Text color="gray.6" size={"sm"} fw={600}>
        You can control a users ICP Fit by uploading different contacts,
        changing personas, adjusting ICP prompt, and more
      </Text>

      <MultiSelect
        mt={"md"}
        styles={(theme) => ({
          label: {
            color: theme.colors.gray[6],
            fontWeight: 700,
          },
        })}
        label="Select personas(s)"
        data={data}
        placeholder="Select items"
        searchable
        creatable
        valueComponent={Value}
        rightSection={<IconChevronDown size="1rem" />}
        getCreateLabel={(query) => `+ Create ${query}`}
        onCreate={(query) => {
          const item = { value: query, label: query };
          setData((current) => [...current, item]);
          return item;
        }}
      />

      <Divider
        variant="solid"
        my="lg"
        label={
          <Text fw={600} size={"lg"} color="gray.7">
            ICP Fir Score Accross Selected Personas
          </Text>
        }
        labelPosition="center"
      />
      <Flex gap={"1rem"} direction={{ base: "column", md: "row" }}>
        <Flex
          sx={(theme) => ({
            border: `1px dashed ${theme.colors.gray[4]}`,
            borderRadius: 12,
          })}
          justify={"center"}
          direction="column"
          gap={"1rem"}
          p={"md"}
        >
          <Text fw={700} color="gray.7" align="center">
            AVERAGE
            <br></br>
            ICP FIT SCORE
          </Text>
          <Flex
            justify={"center"}
            align={"center"}
            sx={(theme) => ({
              backgroundColor: theme.colors.yellow[0],
              borderRadius: 12,
              color: theme.colors.yellow[5],
              fontWeight: 700,
              fontSize: rem(56),
              lineHeight: rem(62),
              padding: `${rem(16)} ${rem(24)}`,
              textAlign: "center",
            })}
          >
            3.21
          </Flex>
          <Text fw={700} color="gray.6" size={"sm"}>
            0 = Very Low; 4 = Very High
          </Text>
        </Flex>
        <Flex
          style={{ flex: 1 }}
          justify={"center"}
          align={"center"}
          w={"100%"}
        >
          <Flex
            h={"100%"}
            w={"100%"}
            direction={"column"}
            align={"flex-start"}
            justify={"flex-end"}
          >
            <BarChart />
          </Flex>
        </Flex>
      </Flex>
    </Paper>
  );
};

export default ProspectFit;
