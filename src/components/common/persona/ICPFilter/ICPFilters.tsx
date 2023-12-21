import { Flex, createStyles } from "@mantine/core";
import ICPFiltersDashboard from "./ICPFiltersDashboard";

type ICPFiltersPropsType = {
  hideTitleBar?: boolean;
}

const ICPFilters = (props: ICPFiltersPropsType) => {
  return (
    <Flex h="100%" w={"100%"}>
      <ICPFiltersDashboard hideTitleBar={props.hideTitleBar} />
    </Flex>
  );
};

export default ICPFilters;
