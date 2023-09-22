import { useRecoilValue } from "recoil";
import { Box, Title, Text, Divider, Flex } from "@mantine/core";
import { pipelineProspectsState } from "@atoms/pipelineAtoms";
import { getProspectList } from "./PipelineSection";
const borderGray = "#E9ECEF";
export function PipelineColumnHeader(props: {
  title: string;
  category: string;
  conversion: number;
  total: number;
  bg: string;
}) {
  const prospects = useRecoilValue(pipelineProspectsState);

  const rawContractSize = getProspectList(
    prospects || [],
    props.category
  ).reduce((acc, prospect) => acc + parseInt(prospect.contract_size), 0);

  return (
    <Box sx={{ border: `1px solid ${borderGray}`, borderRadius: "0.5rem" }}>
      <Flex
        bg={`${props.bg}.1`}
        py={"0.5rem"}
        px={"1rem"}
        align={"center"}
        sx={{ borderTopRightRadius: "0.5rem", borderTopLeftRadius: "0.5rem" }}
      >
        <Title order={6} color={`${props.bg}.6`}>
          {props.title}
        </Title>
        <Flex
          justify={"center"}
          align={"center"}
          px={"1rem"}
          sx={{ borderRadius: 999 }}
          bg={props.bg}
          ml={"0.5rem"}
        >
          <Text color="white" fz={"0.75rem"} fw={700}>
            {props.total}
          </Text>
        </Flex>
      </Flex>
      <Flex
        direction={"column"}
        gap={"0.5rem"}
        py={"0.5rem"}
        px={"1rem"}
        bg={"white"}
        sx={{
          borderBottomRightRadius: "0.5rem",
          borderBottomLeftRadius: "0.5rem",
        }}
      >
        <Flex fz="xs" fw={700}>
          <Text color="gray.6">Raw:&nbsp;</Text>
          <Text>${rawContractSize.toLocaleString()}</Text>
        </Flex>
        <Flex fz="xs" fw={700}>
          <Text color="gray.6">Conversion:&nbsp;</Text>
          <Text>{props.conversion * 100}%</Text>
        </Flex>

        <Flex fz="xs" fw={700}>
          <Text color="gray.6">Predicted Total:&nbsp;</Text>
          <Text color="green">
            ${Math.floor(rawContractSize * props.conversion).toLocaleString()}
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
}
