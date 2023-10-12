import { Paper, Title, Text, Flex, Grid, rem } from "@mantine/core";
import React from "react";
import Card from "./Volume/Card";
import { SCREEN_SIZES } from "@constants/data";

const Volume = () => {
  const cards = [
    {
      title: "Linkedin Volume",
      value: 69,
      hook: true,
      success: true,
      unit: "Message",
      description: "Sell Scale delivered 98% ",
    },
    {
      title: "Email Volume",
      value: 69,
      hook: true,
      success: false,
      unit: "Message",
      description: "Sell Scale delivered 98% ",
    },
    {
      title: "Avg. Time To First Pump",
      value: 3.5,
      hook: true,
      success: true,
      unit: "days",
      description: "Sell Scale delivered 98% ",
    },
    {
      title: "Auto Pump Enable",
      value: 69,
      hook: false,
      success: true,
      description: "Sell Scale delivered 98% ",
    },
  ];
  return (
    <Paper mt={"lg"} p={"lg"} radius={"lg"}>
      <Title order={2}>Message Volume - Coming Soon ⚠️</Title>
      <Text color="gray.6" size={"sm"} fw={600}>
        You can control volume, to an extend, by adjusting Linkedin/Email volume
        & adjusting bump framework toggles
      </Text>

      <Grid
        gutter={"md"}
        sx={(theme) => ({
          marginTop: "1rem",
          [`@media (max-width: ${SCREEN_SIZES.SM})`]: {
            marginTop: 0,
          },
        })}
      >
        {cards.map((card, idx) => (
          <Grid.Col
            xs={12}
            md={3}
            sx={(theme) => ({
              borderRightWidth: card.hook ? "1px" : 0,
              borderRightColor: theme.colors.gray[2],
              borderRightStyle: "solid",
              [`@media (max-width: ${SCREEN_SIZES.SM})`]: {
                borderBottomWidth: card.hook ? "1px" : 0,
                borderBottomColor: theme.colors.gray[2],
                borderBottomStyle: "solid",
                borderRightWidth: 0,
                padding: rem(16),
              },
            })}
            px="md"
          >
            <Card {...card} />
          </Grid.Col>
        ))}
      </Grid>
    </Paper>
  );
};

export default Volume;
