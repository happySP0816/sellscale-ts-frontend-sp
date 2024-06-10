import React, { useState } from 'react';
import { Box, Flex, Text, Select, Badge, Popover } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconDice5 } from "@tabler/icons";

const SubjectDropdown = ({ subjects }: { subjects: string[] }) => {
  const [selectedSubject, setSelectedSubject] = useState(subjects?.[0]);
  const [popoverOpened, { close, open }] = useDisclosure(false);

  return (
    <Box
      style={{
        borderRadius: "8px",
        width: "100%",
        margin: "0 auto", // Center the box horizontally
      }}
    >
      <Flex align="center" gap="xs" justify="center">
        <Text fw={600} size={"sm"}>Subject:</Text>
        <Select
          value={selectedSubject}
          onChange={(value: string) => {
            setSelectedSubject(value);
          }}
          data={subjects && subjects.length > 0 ? subjects.map((subject) => ({
            value: subject,
            label: subject,
          })) : []}
          itemComponent={({ value, label, ...others }) => (
            <div {...others}>
              <Flex align="center" gap="xs">
                <Popover width={200} position="bottom" withArrow shadow="md" opened={popoverOpened}>
                  <Popover.Target>
                    <IconDice5 size={25} onMouseEnter={open} onMouseLeave={close} />
                  </Popover.Target>
                  <Popover.Dropdown sx={{ pointerEvents: 'none' }}>
                    <Text size="sm">These subject lines will be randomly sampled.</Text>
                  </Popover.Dropdown>
                  <Badge>{label}</Badge>
                </Popover>
              </Flex>
            </div>
          )}
          size="xs"
          styles={{ 
            root: { marginLeft: "-5px", width: "100%" }, 
            input: { fontWeight: 600 },
          }}
        />
      </Flex>
    </Box>
  );
};

export default SubjectDropdown;
