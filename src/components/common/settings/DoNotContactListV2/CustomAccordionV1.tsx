import { Accordion, MultiSelect, Text, TextInput } from "@mantine/core";
import { useState } from "react";

export default function CustomAccordionV1(props: any) {
  const {
    accordionValue,
    setAccordionValue,
    itemValue,
    ControlTitle,
    selectedData,
    setSelectedData,
    itemData,
    setItemData,
    setNeedsSave,
    setSaveAsNothing,
    searchData,
    setSearchData,
    data,
    originData,
  } = props;

  console.log("=======", originData);
  return (
    <Accordion
      value={accordionValue}
      style={{
        border: "1px solid #eceaee",
        borderBottom: "0px",
        borderRadius: "6px",
      }}
      mt={"md"}
      onChange={(e) => {
        setAccordionValue(e);
      }}
      styles={{
        content: {
          maxHeight: "200px",
          overflowY: "auto",
        },
        label: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        },
      }}
    >
      <Accordion.Item value={itemValue}>
        <Accordion.Control>
          <Text color="#5b5b5b">{ControlTitle}</Text>
        </Accordion.Control>
        <Accordion.Panel>
          {(selectedData?.length > 0 || originData?.length > 0) && (
            <TextInput
              placeholder={`Search ${ControlTitle}`}
              mb={"sm"}
              onChange={(e) => {
                let filterData = [];
                if (e.target.value === "") {
                  filterData = originData;
                  setSelectedData(filterData);
                } else {
                  filterData = originData.filter((item: any) => item.toLowerCase().includes(e.target.value.toLowerCase()));
                  setSelectedData(filterData);
                }
              }}
            />
          )}
          <MultiSelect
            withinPortal
            variant="default"
            data={
              data !== null
                ? data
                    .map((x: any) => ({
                      value: x,
                      label: x,
                    }))
                    .concat(itemData)
                : itemData
            }
            rightSection={<></>}
            placeholder={`Add ${ControlTitle}`}
            searchable
            creatable
            value={selectedData.sort((a: any, b: any) => a.localeCompare(b))}
            onChange={(value: any) => {
              setSelectedData(value);
              setNeedsSave(true);
              setSaveAsNothing(false);
            }}
            getCreateLabel={(query) => `+ Add a filter for ${query}`}
            onCreate={(query: any) => {
              const item: any = { value: query, label: query };
              setItemData((current: any) => [...current, item]);
              return item;
            }}
            searchValue={searchData}
            onSearchChange={(query) => {
              // If search value includes any newlines, add those items
              let newValue = query;
              let newCompanyNames: {
                value: string;
                label: string;
              }[] = [];

              const matches = [...query.matchAll(/(.*?)\\n/gm)];
              for (const match of matches) {
                newCompanyNames.push({
                  value: match[1],
                  label: match[1],
                });
                newValue = newValue.replace(match[0], "");
              }

              // If there are more than 4 being added, add the last input to the list as well
              if (matches.length > 4) {
                newCompanyNames.push({
                  value: newValue,
                  label: newValue,
                });
                newValue = "";
              }

              if (matches.length > 0) {
                setItemData((current: any) => [...current, ...newCompanyNames]);
                setSelectedData((current: any) => [...current, ...newCompanyNames.map((x) => x.value)]);
                setNeedsSave(true);
                setSaveAsNothing(false);
              }
              setSearchData(newValue);
            }}
          />
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
