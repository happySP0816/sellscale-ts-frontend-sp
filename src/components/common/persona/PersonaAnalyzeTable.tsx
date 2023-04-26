import { Group, Avatar, Text, Accordion, Badge } from "@mantine/core";
import { Icon123 } from "@tabler/icons";

const charactersList = [
  {
    id: "bender",
    image: "https://img.icons8.com/clouds/256/000000/futurama-bender.png",
    label: "Bender Bending Rodríguez",
    description: "Fascinated with cooking, though has no sense of taste",
    content:
      "Bender Bending Rodríguez, (born September 4, 2996), designated Bending Unit 22, and commonly known as Bender, is a bending unit created by a division of MomCorp in Tijuana, Mexico, and his serial number is 2716057. His mugshot id number is 01473. He is Fry's best friend.",
  },

  {
    id: "carol",
    image: "https://img.icons8.com/clouds/256/000000/futurama-mom.png",
    label: "Carol Miller",
    description: "One of the richest people on Earth",
    content:
      "Carol Miller (born January 30, 2880), better known as Mom, is the evil chief executive officer and shareholder of 99.7% of Momcorp, one of the largest industrial conglomerates in the universe and the source of most of Earth's robots. She is also one of the main antagonists of the Futurama series.",
  },

  {
    id: "homer",
    image: "https://img.icons8.com/clouds/256/000000/homer-simpson.png",
    label: "Homer Simpson",
    description: "Overweight, lazy, and often ignorant",
    content:
      "Homer Jay Simpson (born May 12) is the main protagonist and one of the five main characters of The Simpsons series(or show). He is the spouse of Marge Simpson and father of Bart, Lisa and Maggie Simpson.",
  },

  {
    id: "homer",
    image: "https://img.icons8.com/clouds/256/000000/homer-simpson.png",
    label: "Homer Simpson",
    description: "Overweight, lazy, and often ignorant",
    content:
      "Homer Jay Simpson (born May 12) is the main protagonist and one of the five main characters of The Simpsons series(or show). He is the spouse of Marge Simpson and father of Bart, Lisa and Maggie Simpson.",
  },
];

type AccordionLabelProps = {
  name: any;
  tagline: any;
};

function AccordionLabel({ name, tagline }: AccordionLabelProps) {
  return (
    <Group noWrap>
      <Avatar src={<Icon123 />} radius="xl" size="lg" />
      <div>
        <Text size="xs" color="teal">
          Sample Persona:{" "}
        </Text>
        <Text weight="700">{name}</Text>
        <Text size="sm" color="dimmed" weight={400}>
          {tagline}
        </Text>
      </div>
    </Group>
  );
}

type PropsType = {
  data: any;
};

export default function PersonaAnalyzeTable(props: PropsType) {
  const items = props.data.map((item: any) => (
    <Accordion.Item value={item.name} key={item.name}>
      <Accordion.Control>
        <AccordionLabel {...item} />
      </Accordion.Control>
      <Accordion.Panel>
        <Text size="sm">{item.description}</Text>

        <Text size="sm" mt="md">
          Some example titles include:{" "}
        </Text>
        {item?.example_titles?.map((title: any) => (
          <Badge key={title} variant="light" color="teal" size="xs">
            {title}
          </Badge>
        ))}
      </Accordion.Panel>
    </Accordion.Item>
  ));

  return (
    <Accordion chevronPosition="right" variant="contained">
      {items}
    </Accordion>
  );
}
