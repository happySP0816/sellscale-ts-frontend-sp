import PullProspectEmailsCard from "@common/credits/PullProspectEmailsCard";
import RunAccountResearchCard from "@common/credits/RunAccountResearchCard";
import { Flex } from "@mantine/core";

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
      <div>
        <PullProspectEmailsCard archetype_id={props.archetype_id} />
      </div>
      <div>
        <RunAccountResearchCard archetype_id={props.archetype_id} />
      </div>
    </Flex>
  );
}
