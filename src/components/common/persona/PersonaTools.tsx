import PullProspectEmailsCard from "@common/credits/PullProspectEmailsCard";
import RunAccountResearchCard from "@common/credits/RunAccountResearchCard";
import { Flex, Stack } from "@mantine/core";
import CustomResearchPointCard from "./CustomResearchPointCard";

type PropsType = {
  archetype_id: number;
};

export default function PersonaTools(props: PropsType) {
  return (
    <Flex
      direction={{ base: "column", sm: "row" }}
      gap={{ base: "sm", sm: "lg" }}
      justify={{ sm: "center" }}
    >
      <Stack spacing={0}>
        <PullProspectEmailsCard archetype_id={props.archetype_id} />
        <CustomResearchPointCard />
      </Stack>
      <div>
        <RunAccountResearchCard archetype_id={props.archetype_id} />
      </div>
    </Flex>
  );
}
