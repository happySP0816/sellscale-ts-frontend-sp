import { useState } from "react";
import {
  InputBase,
  Box,
  Title,
  Select,
  Tabs,
  Button,
  Flex,
} from "@mantine/core";
import CustomSelect from "./CustomSelect";
import { IconBuildingCommunity, IconPhoto, IconUser } from "@tabler/icons";
type Props = {
  isTesting: boolean;
};
function Filters({ isTesting }: Props) {
  const [data, setData] = useState([
    { value: "react", label: "React" },
    { value: "ng", label: "Angular" },
  ]);

  return (
    <Tabs defaultValue="personal">
      <Tabs.List>
        <Tabs.Tab value="personal" icon={<IconUser size={14} />}>
          Person
        </Tabs.Tab>
        <Tabs.Tab value="company" icon={<IconBuildingCommunity size={14} />}>
          Company
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="personal">
        <Box
          style={{ display: "flex", gap: "1rem", flexDirection: "column" }}
          p="md"
        >
          <CustomSelect
            data={data}
            label="Titles (Included)"
            placeholder="Select options"
            setData={setData}
          />
          <CustomSelect
            data={data}
            label="Titles (Excluded)"
            placeholder="Select options"
            setData={setData}
          />
          <CustomSelect
            data={data}
            label="Industry Keywords (Included)"
            placeholder="Select options"
            setData={setData}
          />
          <CustomSelect
            data={data}
            label="Industry Keywords (Excluded)"
            placeholder="Select options"
            setData={setData}
          />
          <Flex direction="column">
            <Title size={"14px"} fw={"500"}>
              Years of Experience
            </Title>
            <Box
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "1rem",
                alignItems: "center",
                marginTop: "0.2rem",
              }}
            >
              <Select placeholder="$Min" data={data} />
              <Select placeholder="$Max" data={data} />
            </Box>
            <Button mt={"0.5rem"} size="sm" ml={"auto"}>
              Max
            </Button>
          </Flex>
          <CustomSelect
            data={data}
            label="Skills Keywords (Included)"
            placeholder="Select options"
            setData={setData}
          />
          <CustomSelect
            data={data}
            label="Skills Keywords (Excluded)"
            placeholder="Select options"
            setData={setData}
          />
          <CustomSelect
            data={data}
            label="Location Keywords (Included)"
            placeholder="Select options"
            setData={setData}
          />
          <CustomSelect
            data={data}
            label="Location Keywords (Excluded)"
            placeholder="Select options"
            setData={setData}
          />
          <CustomSelect
            data={data}
            label="Bio & Jobs Description (Included)"
            placeholder="Select options"
            setData={setData}
          />
          <CustomSelect
            data={data}
            label="Bio & Jobs Description (Excluded)"
            placeholder="Select options"
            setData={setData}
          />
        </Box>
      </Tabs.Panel>
      <Tabs.Panel value="company">
        <Box
          style={{ display: "flex", gap: "1rem", flexDirection: "column" }}
          p="md"
        >
          <CustomSelect
            data={data}
            label="Companies Keywords (Included)"
            placeholder="Select options"
            setData={setData}
          />
          <CustomSelect
            data={data}
            label="Companies Keywords (Excluded)"
            placeholder="Select options"
            setData={setData}
          />
          <CustomSelect
            data={data}
            label="Location Keywords (Included)"
            placeholder="Select options"
            setData={setData}
          />
          <CustomSelect
            data={data}
            label="Location Keywords (Excluded)"
            placeholder="Select options"
            setData={setData}
          />
          <Flex direction="column">
            <Title size={"14px"} fw={"500"}>
              Employee Count
            </Title>
            <Box
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "1rem",
                alignItems: "center",
                marginTop: "0.2rem",
              }}
            >
              <Select placeholder="$Min" data={data} />
              <Select placeholder="$Max" data={data} />
            </Box>
            <Button mt={"0.5rem"} size="sm" ml={"auto"}>
              Max
            </Button>
          </Flex>
          <CustomSelect
            data={data}
            label="Industries Keywords (Included)"
            placeholder="Select options"
            setData={setData}
          />
          <CustomSelect
            data={data}
            label="Industries Keywords (Excluded)"
            placeholder="Select options"
            setData={setData}
          />
          <CustomSelect
            data={data}
            label="Company Description (Included)"
            placeholder="Select options"
            setData={setData}
          />
          <CustomSelect
            data={data}
            label="Company Description (Excluded)"
            placeholder="Select options"
            setData={setData}
          />
        </Box>
      </Tabs.Panel>
    </Tabs>
  );
}

export default Filters;
