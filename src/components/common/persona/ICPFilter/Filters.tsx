import { useState } from "react";
import { InputBase, Box, Title, Select } from "@mantine/core";
import CustomSelect from "./CustomSelect";

function Filters() {
  const [data, setData] = useState([
    { value: "react", label: "React" },
    { value: "ng", label: "Angular" },
  ]);

  return (
    <Box style={{ display: "flex", gap: "1rem", flexDirection: "column" }}>
      <InputBase label="Name" placeholder="e.g. John Smith" />
      <CustomSelect
        data={data}
        label="Job title"
        placeholder="Select job title"
        setData={setData}
        allowInclude
        allowExclude
        includeCurrent
      />

      <CustomSelect
        data={data}
        label="Seniority"
        placeholder="Select seniority level"
        setData={setData}
        includeCurrent
      />

      <CustomSelect
        data={data}
        label="Department"
        placeholder="Select department"
        setData={setData}
      />

      <CustomSelect
        data={data}
        label="Skills"
        placeholder="e.g PHP"
        setData={setData}
      />

      <CustomSelect
        data={data}
        label="Experience"
        placeholder="Select experience range"
        setData={setData}
      />

      <CustomSelect
        data={data}
        label="Location"
        placeholder="e.g India, Australia"
        setData={setData}
      />

      <CustomSelect
        data={data}
        label="Company"
        placeholder="Select job title"
        setData={setData}
        allowExclude
        includeCurrent
      />

      <Box>
        <Title size={"14px"} fw={"500"}>
          Revenue
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
          <Title size={"14px"} fw={500}>
            to
          </Title>
          <Select placeholder="$Max" data={data} />
        </Box>
      </Box>
    </Box>
  );
}

export default Filters;
