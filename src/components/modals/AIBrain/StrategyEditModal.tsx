import RichTextArea from "@common/library/RichTextArea";
import { Badge, Box, Button, Flex, Group, Radio, Text, TextInput } from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { IconX } from "@tabler/icons";

export default function StrategyEditModal({
  innerProps,
  context,
  id,
}: ContextModalProps<{
  strategies: any;
}>) {
  console.log("======", innerProps.strategies);
  const strategies = innerProps.strategies;
  return (
    <Box>
      <TextInput label="Strategy Name" defaultValue={strategies.title} />
      <TextInput label="Attach Campaigns" placeholder="Search campaigns" mt={20} />
      <Flex gap={"sm"} mt={"sm"} wrap={"wrap"}>
        {strategies.tagged_campaigns?.map((item: any, index: number) => {
          return (
            <Box>
              <Badge
                size="md"
                key={index}
                color="gray"
                rightSection={
                  <IconX
                    size={"0.8rem"}
                    className="mt-[6px] hover:cursor-pointer"
                    onClick={() => {
                      console.log("-");
                    }}
                  />
                }
                sx={{ textTransform: "initial" }}
              >
                {item}
              </Badge>
            </Box>
          );
        })}
      </Flex>
      <Radio.Group label="Status" mt={"md"} value={strategies.status}>
        <Flex mt="8" gap={70}>
          <Radio
            value="Progress"
            label="In Progress"
            styles={{
              label: {
                color: "orange",
                fontSize: "16px",
                fontWeight: 500,
              },
            }}
          />
          <Radio
            value="Failed"
            label="Failed"
            styles={{
              label: {
                color: "red",
                fontSize: "16px",
                fontWeight: 500,
              },
            }}
          />
          <Radio
            value="Success"
            label="Success"
            styles={{
              label: {
                color: "green",
                fontSize: "16px",
                fontWeight: 500,
              },
            }}
          />
        </Flex>
      </Radio.Group>
      <Box mt={20}>
        <Text fw={500} size={"sm"} mb={"8"}>
          Description
        </Text>
        <RichTextArea height={200} />
      </Box>
      <Flex gap={"xl"} mt={40}>
        <Button variant="outline" color="gray" fullWidth>
          Cancel
        </Button>
        <Button fullWidth>Save Strategy</Button>
      </Flex>
    </Box>
  );
}
