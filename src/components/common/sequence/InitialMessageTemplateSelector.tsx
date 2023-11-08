import { useState, useEffect } from 'react';
import { Badge, Button, Group, Input, Loader, Modal, Text, Title, Grid } from '@mantine/core';
import { useRecoilValue } from 'recoil';
import { userTokenState } from '@atoms/userAtoms';
import LinkedinInitialMessageTemplate from './LinkedinInitialMessageTemplate';
import { API_URL } from '@constants/data';
import { deterministicMantineColor } from '@utils/requests/utils';

type PropsType = {
  onSelect: (template: LinkedinInitialMessageTemplate) => void;
};

function InitialMessageTemplateSelector({ onSelect }: PropsType) {
  const [opened, setOpened] = useState(false);
  const [templates, setTemplates] = useState<LinkedinInitialMessageTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const userToken = useRecoilValue(userTokenState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      const response = await fetch(`${API_URL}/linkedin_template/linkedin_initial_message_templates`, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + userToken,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setLoading(false);
      setTemplates(data.linkedin_initial_message_templates.map((template: any) => new LinkedinInitialMessageTemplate(template)));
    };

    fetchTemplates();
  }, [userToken]);

  const filteredTemplates = templates.filter((template) => {
    const lowercaseSearchTerm = searchTerm.toLowerCase();
    const lowercaseTone = template.tone.toLowerCase();

    // Check if any part of the template matches the search term
    const matchesSearchTerm =
      template.name.toLowerCase().includes(lowercaseSearchTerm) ||
      template.human_readable_prompt.toLowerCase().includes(lowercaseSearchTerm) ||
      lowercaseTone.includes(lowercaseSearchTerm) || // Check for tone
      template.labels.some((label) => label.toLowerCase().includes(lowercaseSearchTerm)); // Check for labels

    return matchesSearchTerm;
  });

  return (
    <>
      <Button onClick={() => setOpened(true)} variant="outline" radius="md" compact color="blue" mr='xs'>
        ✨ Choose a Template
      </Button>

      <Modal opened={opened} onClose={() => setOpened(false)} title="Select a Template" size="lg">
        {loading ? (
          <Loader variant="dots" />
        ) : (
          <>
            <Input
              placeholder="Search templates..."
              mb="md"
              onChange={(event) => setSearchTerm(event.currentTarget.value)}
            />

            <Grid gutter="md">
                {filteredTemplates.map((template) => (
                    <Grid.Col span={6} key={template.id}>
                    <div
                        onClick={() => {
                        onSelect(template);
                        setOpened(false);
                        }}
                        style={{
                            cursor: 'pointer',
                            padding: '10px',
                            borderRadius: '8px', // Set border radius to 8px
                            transition: 'background-color 0.3s',
                            marginBottom: 'xs', // Add 'xs' spacing between items
                            border: '1px solid #dedede',
                            height: '100%',
                            minHeight: '100px',
                        }}
                        onMouseEnter={(event) => {
                            event.currentTarget.style.backgroundColor = '#f5f5f5';
                        }}
                        onMouseLeave={(event) => {
                            event.currentTarget.style.backgroundColor = 'white';
                        }}
                    >
                        <Title order={5}>{template.name}</Title>
                        <Text size="xs" color="gray">
                        {template.human_readable_prompt}
                        </Text>
                        <Group spacing="xs" mt="xs">
                        <Badge
                            key={template.tone}
                            variant="filled"
                            color={deterministicMantineColor(template.tone)}
                            size="xs"
                        >
                            {template.tone}
                        </Badge>
                        {template.labels.map((label) => (
                            <Badge key={label} variant="outline" color="gray" size="xs">
                            {label}
                            </Badge>
                        ))}
                        </Group>
                    </div>
                    </Grid.Col>
                ))}
            </Grid>

          </>
        )}
      </Modal>
    </>
  );
}

export default InitialMessageTemplateSelector;
