import {
  ActionIcon,
  Badge,
  Divider,
  Flex,
  Group,
  HoverCard,
  Text,
  Title,
  createStyles,
} from '@mantine/core';
import { IconCircleCheck, IconMail } from '@tabler/icons';
import { EmailStore } from 'src';

const useStyles = createStyles((theme) => ({
  icon: {
    color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[5],
  },

  name: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
  },
}));

type EmailStoreProps = {
  email: string;
  emailStore: EmailStore | null | undefined;
  isValid: boolean;
  showInfoCard?: boolean;
};

export default function EmailStoreView(props: EmailStoreProps) {
  const { classes } = useStyles();

  let isFormatGood = 'invalid';
  let formatMessage = '';
  if (props.emailStore?.hunter_regexp) {
    if (props.emailStore?.hunter_gibberish) {
      isFormatGood = 'gibberish';
      formatMessage = 'This email address has the correct format, but may be gibberish.';
    } else {
      isFormatGood = 'valid';
      formatMessage = 'This email address has the correct format and is not gibberish.';
    }
  } else {
    if (props.emailStore?.hunter_gibberish) {
      isFormatGood = 'invalid';
      formatMessage = 'This email address is gibberish and does not have the correct format.';
    } else {
      isFormatGood = 'format';
      formatMessage = 'This email address does not seem like gibberish, but may not have the correct format.';
    }
  }

  let isTypeGood = 'invalid';
  let typeMessage = '';
  if (!props.emailStore?.hunter_webmail && !props.emailStore?.hunter_disposable) {
    isTypeGood = 'professional';
    typeMessage =
      "The domain name isn't used for webmails or for creating temporary email addresses.";
  } else if (!props.emailStore?.hunter_webmail) {
    isTypeGood = 'webmail';
    typeMessage = 'The domain name is used for webmails, such as GMail, Yahoo, etc.';
  } else if (!props.emailStore?.hunter_disposable) {
    isTypeGood = 'disposable';
    typeMessage = 'The domain name is used for creating temporary email addresses.';
  } else {
    isTypeGood = 'invalid';
    typeMessage = 'The type of this email address could not be determined.';
  }

  let isServerGood = 'invalid';
  let serverMessage = '';
  if (props.emailStore?.hunter_mx_records && props.emailStore?.hunter_smtp_check) {
    isServerGood = 'valid';
    serverMessage = 'MX records are present for the domain, and we can connect to the SMTP server.';
  } else {
    isServerGood = 'invalid';
    serverMessage =
      'MX records are not present for the domain, or we cannot connect to the SMTP server.';
  }

  let isDeliverableGood = 'invalid';
  let deliverableMessage = '';
  if (
    props.emailStore?.hunter_smtp_check &&
    !props.emailStore?.hunter_accept_all &&
    !props.emailStore?.hunter_block
  ) {
    isDeliverableGood = 'valid';
    deliverableMessage = 'This email address exists and can receive emails.';
  } else if (props.emailStore?.hunter_accept_all) {
    isDeliverableGood = 'accept-all';
    deliverableMessage = 'This email address could exist, but we cannot be sure.';
  } else if (props.emailStore?.hunter_block) {
    isDeliverableGood = 'block';
    deliverableMessage = 'This email address could exist, but we cannot be sure.';
  } else {
    isDeliverableGood = 'invalid';
    deliverableMessage = 'This email address does not exist.';
  }

  return props.showInfoCard ? (
    <Flex direction='column' w={300}>
      <Group noWrap spacing={10} mt={5}>
        <IconMail stroke={1.5} size={16} className={classes.icon} />
        <Text size='xs' color='dimmed' component='a' href={`mailto:${props.email}`}>
          {props.email}
        </Text>
        {props.isValid && (
          <ActionIcon color='blue' variant='subtle' aria-label='Valid Email' radius='xl'>
            <IconCircleCheck style={{ width: '70%', height: '70%' }} stroke={1.5} />
          </ActionIcon>
        )}
      </Group>
      {props.emailStore ? (
        <Flex direction='column'>
          <Flex align='center'>
            <Title order={4}>Email</Title>
            <Badge
              ml='sm'
              size='sm'
              color={props.emailStore.hunter_status === 'verified' ? 'green' : 'red'}
            >
              {props.emailStore.hunter_status}
            </Badge>
          </Flex>
          <Divider mt='xs' />

          <Flex mt='sm' direction='column'>
            <Flex align='center'>
              <Text fz='sm' fw='bold'>
                Format
              </Text>
              <Badge ml='xs' size='sm' color={isFormatGood === 'valid' ? 'green' : 'red'}>
                {isFormatGood === 'valid' ? 'Valid' : 'Invalid'}
              </Badge>
            </Flex>
            <Text fz='xs'>{formatMessage}</Text>
          </Flex>

          <Flex mt='sm' direction='column'>
            <Flex align='center'>
              <Text fz='sm' fw='bold'>
                Type
              </Text>
              <Badge
                ml='xs'
                size='sm'
                color={
                  isTypeGood === 'professional'
                    ? 'green'
                    : isTypeGood === 'webmail'
                    ? 'yellow'
                    : isTypeGood === 'disposable'
                    ? 'red'
                    : 'red'
                }
              >
                {isTypeGood === 'professional'
                  ? 'Professional'
                  : isTypeGood === 'webmail'
                  ? 'Webmail'
                  : isTypeGood === 'disposable'
                  ? 'Disposable'
                  : 'Invalid'}
              </Badge>
            </Flex>
            <Text fz='xs'>{typeMessage}</Text>
          </Flex>

          <Flex mt='sm' direction='column'>
            <Flex align='center'>
              <Text fz='sm' fw='bold'>
                Server status
              </Text>
              <Badge ml='xs' size='sm' color={isServerGood === 'valid' ? 'green' : 'red'}>
                {isServerGood === 'valid' ? 'Valid' : 'Invalid'}
              </Badge>
            </Flex>
            <Text fz='xs'>{serverMessage}</Text>
          </Flex>

          <Flex mt='sm' direction='column'>
            <Flex align='center'>
              <Text fz='sm' fw='bold'>
                Deliverability
              </Text>
              <Badge
                ml='xs'
                size='sm'
                color={
                  isDeliverableGood === 'valid'
                    ? 'green'
                    : isDeliverableGood === 'accept-all'
                    ? 'yellow'
                    : isDeliverableGood === 'block'
                    ? 'red'
                    : 'red'
                }
              >
                {isDeliverableGood === 'valid'
                  ? 'Valid'
                  : isDeliverableGood === 'accept-all'
                  ? 'Accept-all'
                  : isDeliverableGood === 'block'
                  ? 'Block'
                  : 'Invalid'}
              </Badge>
            </Flex>
            <Text fz='xs'>{deliverableMessage}</Text>
          </Flex>
        </Flex>
      ) : (
        <Text>
          Email verification metadata available for Prospects uploaded after August, 2023.
        </Text>
      )}
    </Flex>
  ) : (
    <HoverCard width={300} shadow='md' withArrow withinPortal>
      <HoverCard.Target>
        <Group noWrap spacing={10} mt={5}>
          <IconMail stroke={1.5} size={16} className={classes.icon} />
          <Text size='xs' color='dimmed' component='a' href={`mailto:${props.email}`}>
            {props.email}
          </Text>
          {props.isValid && (
            <ActionIcon color='blue' variant='subtle' aria-label='Valid Email' radius='xl'>
              <IconCircleCheck style={{ width: '70%', height: '70%' }} stroke={1.5} />
            </ActionIcon>
          )}
        </Group>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        {props.emailStore ? (
          <Flex direction='column'>
            <Flex align='center'>
              <Title order={4}>Email</Title>
              <Badge
                ml='sm'
                size='sm'
                color={props.emailStore.hunter_status === 'valid' ? 'green' : 'red'}
              >
                {props.emailStore.hunter_status}
              </Badge>
            </Flex>
            <Divider mt='xs' />

            <Flex mt='sm' direction='column'>
              <Flex align='center'>
                <Text fz='sm' fw='bold'>
                  Format
                </Text>
                <Badge ml='xs' size='sm' color={isFormatGood === 'valid' ? 'green' : 'red'}>
                  {isFormatGood === 'valid' ? 'Valid' : 'Invalid'}
                </Badge>
              </Flex>
              <Text fz='xs'>{formatMessage}</Text>
            </Flex>

            <Flex mt='sm' direction='column'>
              <Flex align='center'>
                <Text fz='sm' fw='bold'>
                  Type
                </Text>
                <Badge
                  ml='xs'
                  size='sm'
                  color={
                    isTypeGood === 'professional'
                      ? 'green'
                      : isTypeGood === 'webmail'
                      ? 'yellow'
                      : isTypeGood === 'disposable'
                      ? 'red'
                      : 'red'
                  }
                >
                  {isTypeGood === 'professional'
                    ? 'Professional'
                    : isTypeGood === 'webmail'
                    ? 'Webmail'
                    : isTypeGood === 'disposable'
                    ? 'Disposable'
                    : 'Invalid'}
                </Badge>
              </Flex>
              <Text fz='xs'>{typeMessage}</Text>
            </Flex>

            <Flex mt='sm' direction='column'>
              <Flex align='center'>
                <Text fz='sm' fw='bold'>
                  Server status
                </Text>
                <Badge ml='xs' size='sm' color={isServerGood === 'valid' ? 'green' : 'red'}>
                  {isServerGood === 'valid' ? 'Valid' : 'Invalid'}
                </Badge>
              </Flex>
              <Text fz='xs'>{serverMessage}</Text>
            </Flex>

            <Flex mt='sm' direction='column'>
              <Flex align='center'>
                <Text fz='sm' fw='bold'>
                  Deliverability
                </Text>
                <Badge
                  ml='xs'
                  size='sm'
                  color={
                    isDeliverableGood === 'valid'
                      ? 'green'
                      : isDeliverableGood === 'accept-all'
                      ? 'yellow'
                      : isDeliverableGood === 'block'
                      ? 'red'
                      : 'red'
                  }
                >
                  {isDeliverableGood === 'valid'
                    ? 'Valid'
                    : isDeliverableGood === 'accept-all'
                    ? 'Accept-all'
                    : isDeliverableGood === 'block'
                    ? 'Block'
                    : 'Invalid'}
                </Badge>
              </Flex>
              <Text fz='xs'>{deliverableMessage}</Text>
            </Flex>
          </Flex>
        ) : (
          <Text>
            Email verification metadata available for Prospects uploaded after August, 2023.
          </Text>
        )}
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
