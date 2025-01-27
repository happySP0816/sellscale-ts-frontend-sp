import { Box, Checkbox, MultiSelect, Title } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { useState } from "react";

interface ICustomSelect {
  data: string[];
  label?: string | JSX.Element;
  description?: string;
  placeholder?: string;
  includeCurrent?: boolean;
  allowInclude?: boolean;
  allowExclude?: boolean;
  color?: "green" | "red";
  maxWidth?: string;
  minHeight?: string;
  setData?: React.Dispatch<React.SetStateAction<string[]>>;
  setDataSegment?:  (values: string | string[] | number, dealbreaker?: boolean, is_personalizer?: boolean) => void;
  value: string[];
  setValue?: React.Dispatch<React.SetStateAction<string[]>>;
  setValueSegment?: (values: string | string[] | number, dealbreaker?: boolean, is_personalizer?: boolean) => void;
  key?: string;
}

const CustomSelect = ({
  data,
  value,
  setValue,
  label = "",
  description = "",
  placeholder = "Select",
  includeCurrent = false,
  allowInclude = false,
  allowExclude = false,
  color = "green",
  maxWidth = "100%",
  minHeight = "",
  setData,
  setValueSegment,
  setDataSegment,
}: ICustomSelect) => {
  const [searchValue, onSearchChange] = useState("");
  const [isIncludeSelected, setIsIncludeSelected] = useState(false);
  const [isExcludeSelected, setIsExcludeSelected] = useState(false);

  return (
    <>
      <MultiSelect
        data={data}
        value={value}
        onChange={(value) => setValueSegment ? setValueSegment(value) : setValue!(value)}
        description={description}
        label={
          label ? (
            <Box
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Title size={"14px"} fw={"500"} color="gray.6">
                {label}
              </Title>

              {includeCurrent && (
                <Box
                  style={{
                    display: "flex",
                    gap: "1rem",
                  }}
                >
                  <Title size="12px" fw="500" color="#47464">
                    Current
                  </Title>
                  <IconChevronDown size="1rem" />
                </Box>
              )}
            </Box>
          ) : undefined
        }
        placeholder={placeholder}
        searchable
        maw={maxWidth}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        rightSection={<IconChevronDown size="1rem" />}
        nothingFound="Nothing found"
        clearButtonProps={{ "aria-label": "Clear selection" }}
        clearable
        creatable
        getCreateLabel={(query) => `+ Create ${query}`}
        onCreate={(query) => {
          const item = { value: query, label: query };
          if (setData) {
            setData((current) => [...current, query]);
          }
          if (setDataSegment) {
            setDataSegment([...value, query])
          }
          return item;
        }}
        zIndex={9999}
        styles={{
          rightSection: { pointerEvents: "none" },
          label: { width: "100%" },
          value: {
            backgroundColor: color === "red" ? "rgba(231, 95, 89, 0.1)" : "rgba(0, 149, 18, 0.1)",
            border: color === "red" ? "0.6px solid #E75F59" : "0.6px solid #009512",
          },
          input: {
            minHeight: minHeight ? minHeight : "",
          },
        }}
      />
      {allowInclude && (
        <>
          <Checkbox label={`Include related`} checked={isIncludeSelected} onChange={(event) => setIsIncludeSelected(event.currentTarget.checked)} />
          {isIncludeSelected && <CustomSelect value={value} setValue={setValue} data={data} placeholder="e.g data analyst" setData={setData} color={"green"} />}
        </>
      )}
      {allowExclude && (
        <>
          <Checkbox label={`Exclude related`} checked={isExcludeSelected} onChange={(event) => setIsExcludeSelected(event.currentTarget.checked)} />
          {isExcludeSelected && <CustomSelect value={value} setValue={setValue} data={data} placeholder="e.g data analyst" setData={setData} color={"red"} />}
        </>
      )}
    </>
  );
};

export default CustomSelect;
