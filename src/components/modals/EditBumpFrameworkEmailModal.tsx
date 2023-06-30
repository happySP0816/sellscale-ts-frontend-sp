import { userTokenState } from "@atoms/userAtoms";
import EmailBlockPreview from "@common/emails/EmailBlockPreview";
import { EmailBlocksDND } from "@common/emails/EmailBlocksDND";
import { Button, Divider, Flex, LoadingOverlay, NumberInput, Paper, ScrollArea, Slider, Switch, Text, TextInput, Textarea, Title, Tooltip, em, useMantineTheme } from "@mantine/core";
import { useForm } from "@mantine/form";
import { ContextModalProps } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { patchEmailBumpFramework } from "@utils/requests/patchBumpFramework";
import { postEmailBumpDeactivate } from "@utils/requests/postBumpDeactivate";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

interface EditBumpFrameworkEmail extends Record<string, unknown> {
  emailBumpFrameworkID: number;
  archetypeID: number;
  overallStatus: string; // Note that this is used as an identifier
  title: string;
  emailBlocks: string[];
  default: boolean;
  onSave: () => void;
  bumpedCount?: number;
}

export default function EditEmailBumpFrameworkModal({ context, id, innerProps }: ContextModalProps<EditBumpFrameworkEmail>) {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const [loading, setLoading] = useState(false);

  const [emailBlocks, setEmailBlocks] = useState<string[]>(innerProps.emailBlocks);

  const form = useForm({
    initialValues: {
      title: innerProps.title,
      bumpedCount: innerProps.bumpedCount ?? null,
      default: innerProps.default,
    },
  });

  const triggerPostBumpDeactivate = async () => {
    setLoading(true);

    const result = await postEmailBumpDeactivate(
      userToken,
      innerProps.emailBumpFrameworkID,
    );
    if (result.status === "success") {
      showNotification({
        title: "Success",
        message: "Bump Framework deactivated successfully",
        color: theme.colors.green[7],
      });
      setLoading(false);
      context.closeModal(id);
    } else {
      showNotification({
        title: "Error",
        message: result.message,
        color: theme.colors.red[7],
      });
    }

    setLoading(false);
  };

  const triggerEditEmailBumpFramework = async () => {
    setLoading(true);

    const result = await patchEmailBumpFramework(
      userToken,
      innerProps.emailBumpFrameworkID,
      innerProps.overallStatus,
      form.values.title,
      emailBlocks,
      form.values.bumpedCount,
      form.values.default,
    );

    if (result.status === "success") {
      showNotification({
        title: "Success",
        message: "Bump Framework updated successfully",
        color: theme.colors.green[7],
      });
      setLoading(false);
      innerProps.onSave();
      context.closeModal(id);
    } else {
      showNotification({
        title: "Error",
        message: result.message,
        color: theme.colors.red[7],
      });
    }

    setLoading(false);
  };

  return (
    <Paper
      p={0}
      style={{
        position: 'relative',
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
        minHeight: 400,
      }}
    >
      <LoadingOverlay visible={loading} />
      <Flex direction='row' mih='75vh'>

        <Flex w='auto'>
          <Flex w='50%' mr='md' mah='80vh'>
            <Flex direction='column'>
              <TextInput
                mr='xs'
                label="Title"
                placeholder={"Mention the Super Bowl"}
                {...form.getInputProps("title")}
              />
              {
                (form.values.bumpedCount != null && form.values.bumpedCount > 0) ? (
                  <NumberInput
                    mt='sm'
                    label="Bump Number"
                    description="The position in the bump sequence."
                    placeholder="1"
                    value={form.values.bumpedCount as number}
                    onChange={(e) => {
                      form.setFieldValue("bumpedCount", e as number);
                    }}
                    min={1}
                  />
                ) : <></>
              }
              <Switch
                mt='md'
                label="Default Framework?"
                labelPosition="left"
                checked={form.values.default}
                onChange={(e) => {
                  form.setFieldValue(
                    "default",
                    e.currentTarget.checked
                  );
                }}
              />
              <ScrollArea type='hover' mt='xl' offsetScrollbars>
                <EmailBlocksDND
                  archetypeId={innerProps.archetypeID as number}
                  emailBumpFrameworkId={innerProps.emailBumpFrameworkID as number}
                  getNewOrder={(newEmailBlocks) => {
                    if (newEmailBlocks.length === 0) {
                      return;
                    }
                    setEmailBlocks(newEmailBlocks)
                  }}
                />
              </ScrollArea>
              <Flex>
                <Flex justify="space-between" w="100%">
                  <Flex>
                    <Button
                      mt="md"
                      color="red"
                      onClick={() => {
                        triggerPostBumpDeactivate();
                      }}
                    >
                      Deactivate
                    </Button>
                  </Flex>
                  <Flex>
                    {innerProps.title ==
                      form.values.title.trim() &&
                      innerProps.default ==
                      form.values.default &&
                      innerProps.bumpedCount ==
                      form.values.bumpedCount &&
                      innerProps.emailBlocks ==
                      emailBlocks ?
                      (
                        <></>
                      ) : (
                        <Button
                          mt="md"
                          onClick={() => {
                            triggerEditEmailBumpFramework();
                          }}
                        >
                          Save
                        </Button>
                      )}
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </Flex>

          <Flex w='50%' mah='80vh'>
            <ScrollArea type='hover'>
              <EmailBlockPreview archetypeId={innerProps.archetypeID as number} emailBlocks={emailBlocks} />
            </ScrollArea>
          </Flex>

        </Flex>
      </Flex>
    </Paper>
  )
}