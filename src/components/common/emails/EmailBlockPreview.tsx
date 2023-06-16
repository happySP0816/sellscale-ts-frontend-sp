import { userTokenState } from '@atoms/userAtoms';
import {
  Badge,
  Button,
  Card,
  Center,
  Flex,
  Group,
  Select,
  Text,
  TextInput,
  Textarea,
  Title,
  createStyles,
  useMantineTheme,
} from '@mantine/core';
import { RichTextEditor, Link } from '@mantine/tiptap';
import Highlight from '@tiptap/extension-highlight';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript';
import SubScript from '@tiptap/extension-subscript';
import Placeholder from '@tiptap/extension-placeholder';
import { IconBrandLinkedin } from '@tabler/icons';
import { useEditor } from '@tiptap/react';
import { valueToColor } from '@utils/general';
import { generateEmailAutomatic } from '@utils/requests/generateEmail';
import { getArchetypeProspects } from '@utils/requests/getArchetypeProspects';
import DOMPurify from 'dompurify';
import { forwardRef, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { ProspectShallow } from 'src';
import { Markdown } from 'tiptap-markdown';

interface ProspectItemProps extends React.ComponentPropsWithoutRef<'div'> {
  label: string;
  icpFit: number;
  title: string;
  company: string;
}

let icpFitScoreMap = new Map<string, string>([
  ['-3', 'QUEUED'],
  ['-2', 'CALCULATING'],
  ['-1', 'ERROR'],
  ['0', 'VERY LOW'],
  ['1', 'LOW'],
  ['2', 'MEDIUM'],
  ['3', 'HIGH'],
  ['4', 'VERY HIGH'],
]);

const useStyles = createStyles((theme) => ({
  icon: {
    color: theme.colors.gray[6],
  },
}));

export default function EmailBlockPreview(props: { archetypeId: number }) {
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const userToken = useRecoilValue(userTokenState);
  const [prospects, setProspects] = useState<ProspectShallow[]>([]);
  const [selectedProspect, setSelectedProspect] = useState<ProspectShallow>();

  const [loading, setLoading] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<{ subject: string; body: string } | null>(null);

  const previewBodyEditor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
    ],
    content: '',
    editable: false,
  });

  console.log(previewEmail?.body);

  useEffect(() => {
    previewBodyEditor && previewEmail?.body && previewBodyEditor.commands.setContent(previewEmail.body);
  }, [previewEmail]);

  useEffect(() => {
    (async () => {
      const result = await getArchetypeProspects(userToken, props.archetypeId);

      if (result.status === 'success') {
        setProspects((prev) => {
          const prospects = result.data as ProspectShallow[];
          return prospects.sort((a, b) => {
            if (a.icp_fit_score === b.icp_fit_score) {
              return a.full_name.localeCompare(b.full_name);
            }
            return b.icp_fit_score - a.icp_fit_score;
          });
        });
      }
    })();
  }, []);

  const ProspectSelectItem = forwardRef<HTMLDivElement, ProspectItemProps>(
    ({ label, icpFit, title, company, ...others }: ProspectItemProps, ref) => (
      <div ref={ref} {...others}>
        <Flex justify={'space-between'}>
          <Text>{label}</Text>
          {icpFit ? (
            <Badge color={valueToColor(theme, icpFitScoreMap.get(icpFit.toString()) || 'NONE')}>
              {icpFitScoreMap.get(icpFit.toString())}
            </Badge>
          ) : (
            <Badge color={valueToColor(theme, 'NONE')}>NONE</Badge>
          )}
        </Flex>
        <Text fz='xs'>
          {title} @ {company}
        </Text>
      </div>
    )
  );

  return (
    <>
      <Card withBorder>
        <Text fz='lg' fw='bold'>
          Email Preview
        </Text>
        <Text fz='sm'>Test your email block configuration on a prospect of your choosing.</Text>

        <Select
          mt='md'
          label='Select a prospect'
          placeholder='Pick one'
          itemComponent={ProspectSelectItem}
          searchable
          clearable
          nothingFound='No prospects found'
          value={selectedProspect ? selectedProspect.id + '' : '-1'}
          data={prospects.map((prospect) => {
            return {
              value: prospect.id + '',
              label: prospect.full_name,
              icpFit: prospect.icp_fit_score,
              title: prospect.title,
              company: prospect.company,
            };
          })}
          onChange={(value) => {
            if (!value) {
              setSelectedProspect(undefined);
              return;
            }
            const foundProspect = prospects.find((prospect) => prospect.id === (parseInt(value) || -1));
            setSelectedProspect(foundProspect);
          }}
          withinPortal
        />

        {selectedProspect && (
          <>
            <Card>
              <Text fz='lg' fw='bold'>
                {selectedProspect.full_name}
              </Text>
              <Text fz='sm'>
                {selectedProspect.title} @ {selectedProspect.company}
              </Text>

              {selectedProspect.li_public_id && (
                <Group noWrap spacing={10} mt={5}>
                  <IconBrandLinkedin stroke={1.5} size={16} className={classes.icon} />
                  <Text
                    size='xs'
                    color='dimmed'
                    component='a'
                    target='_blank'
                    rel='noopener noreferrer'
                    href={`https://www.linkedin.com/in/${selectedProspect.li_public_id}`}
                  >
                    linkedin.com/in/{selectedProspect.li_public_id}
                  </Text>
                </Group>
              )}
            </Card>
            <Center>
              <Button
                variant='light'
                color='teal'
                radius='md'
                loading={loading}
                onClick={async () => {
                  setLoading(true);
                  const response = await generateEmailAutomatic(userToken, selectedProspect.id);
                  if (response.status === 'success') {
                    setPreviewEmail(response.data);
                  }
                  setLoading(false);
                }}
              >
                Generate Preview
              </Button>
            </Center>
          </>
        )}
      </Card>
      {previewEmail && (
        <Card>
          <TextInput label='Subject' value={previewEmail.subject} readOnly />

          <Text mt='md' fz='sm' fw={500}>Body</Text>
          <RichTextEditor
            editor={previewBodyEditor}
            styles={{
              content: {
                p: {
                  fontSize: 14,
                },
                minHeight: 200,
              },
            }}
          >
            <RichTextEditor.Content />
          </RichTextEditor>
        </Card>
      )}
    </>
  );
}
