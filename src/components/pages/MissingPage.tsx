import { createStyles, Title, Image, Text, Button, Container, Group, rem } from '@mantine/core';
import { setPageTitle } from '@utils/documentChange';
import Guy404 from '@assets/images/404-guy.png';

const useStyles = createStyles((theme) => ({
  root: {
    paddingTop: rem(80),
    paddingBottom: rem(80),
  },

  label: {
    textAlign: 'center',
    fontWeight: 900,
    fontSize: rem(300),
    lineHeight: 1,
    color: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2],
    marginBottom: -250,

    [theme.fn.smallerThan('sm')]: {
      fontSize: rem(120),
    },
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    textAlign: 'center',
    fontWeight: 900,
    fontSize: rem(38),
    marginTop: -20,

    [theme.fn.smallerThan('sm')]: {
      fontSize: rem(32),
    },
  },

  description: {
    maxWidth: rem(500),
    margin: 'auto',
    marginTop: theme.spacing.xl,
    marginBottom: `calc(${theme.spacing.xl} * 1.5)`,
  },
}));

export default function MissingPage() {
  const { classes } = useStyles();
  setPageTitle(`Error 404`);

  return (
    <Container className={classes.root}>
      <div className={classes.label}>404</div>
      <div>
        <Image maw={240} mx="auto" radius="md" src={Guy404} alt="Random image" />
      </div>
      <Title className={classes.title}>You found a secret place.</Title>
      <Text color="dimmed" size="lg" align="center" className={classes.description}>
        Unfortunately, this is only a 404 page. You may have mistyped the address, or the page has
        been moved to another URL.
      </Text>
      <Group position="center">
        <Button variant="subtle" size="md" color='green'>
          Take me back to home page
        </Button>
      </Group>
    </Container>
  );
}
