import React, { useState, useRef, useEffect } from 'react';
import { Box, Flex, Text, Select, Badge, Popover } from '@mantine/core';
import { IconAlertCircle, IconDice5 } from "@tabler/icons";

const SubjectDropdown = ({ emailSubjectLines }: { emailSubjectLines: { subject_line: string, is_magic_subject_line: boolean | null }[] }) => {
  const subjects = emailSubjectLines?.map(line => line?.subject_line);
  const [selectedSubject, setSelectedSubject] = useState('0');
  const [popoverOpenedArray, setPopoverOpenedArray] = useState<boolean[]>(subjects?.map(() => false));
  const popoverRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    popoverRefs.current.forEach((ref, index) => {
      if (ref && popoverOpenedArray[index]) {
        const rect = ref.getBoundingClientRect();
        console.log(`Popover position for subject ${index}:`, rect);
      }
    });
  }, [selectedSubject, popoverOpenedArray]);

  const handlePopoverOpen = (index: number) => {
    setPopoverOpenedArray(popoverOpenedArray.map((opened, i) => i === index));
  };

  const handlePopoverClose = () => {
    setPopoverOpenedArray(popoverOpenedArray.map(() => false));
  };

  return (
    <Box
      style={{
        borderRadius: "8px",
        width: "100%",
        margin: "0 auto", // Center the box horizontally
      }}
    >
      <Flex mb="sm" align="center" gap="xs" justify="center">
        <Text fw={600} size={"sm"}>Subject:</Text>
        {subjects && subjects.length > 0 ? (
          <Select
            value={String(selectedSubject)}
            onChange={(value: string) => {
              setSelectedSubject(value);
            }}
            data={emailSubjectLines.map((line, index) => ({
              value: String(index),
              label: line.is_magic_subject_line ? '[[Magic Subject Line]]' : line.subject_line,
              index: index,
            }))}
            itemComponent={({ value, label, index, ...others }) => (
              <div {...others}>
                <Flex align="center" gap="xs">
                  <Popover 
                    position="bottom" 
                    withinPortal 
                    withArrow 
                    shadow="md" 
                    opened={popoverOpenedArray[index]}
                    offset={10}
                    onPositionChange={(position) => console.log('Popover position:', position)}
                    positionDependencies={[selectedSubject]}
                    onClose={handlePopoverClose}
                    onOpen={() => handlePopoverOpen(index)}
                    keepMounted
                    transitionProps={{ duration: 150, transition: 'fade' }}
                    width="auto" 
                    middlewares={{ shift: true, flip: true }}
                    arrowSize={10}
                    arrowOffset={5}
                    arrowRadius={2}
                    arrowPosition="center"
                    zIndex={1000}
                    radius="md"
                  >
                    <Popover.Target>
                      <div ref={(el) => (popoverRefs.current[index] = el)}>
                        <IconDice5 size={25} onMouseEnter={() => handlePopoverOpen(index)} onMouseLeave={handlePopoverClose} />
                      </div>
                    </Popover.Target>
                    <Popover.Dropdown sx={{ pointerEvents: 'none' }}>
                      <Text size="sm">These subject lines will be randomly sampled when sending outbound <br/> to identify the most effective one for engaging your audience.</Text>
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
        ) : (
          <Flex align="center" gap="xs">
            <Text color="red" fw={600} size={"sm"}>Please add a subject line</Text>
            <IconAlertCircle size={16} color="red" />
          </Flex>
        )}
      </Flex>
    </Box>
  );
};

export default SubjectDropdown;
