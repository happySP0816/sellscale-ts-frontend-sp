import { createStyles } from '@mantine/core';

export default createStyles((theme) => ({
  root: {
    height: 36,
    paddingLeft: theme.spacing.sm,
    paddingRight: 5,
    borderRadius: theme.radius.sm,
    color: theme.colors.gray[4],
    fontWeight: 500,
    backgroundColor: theme.fn.lighten(
      theme.fn.variant({ variant: "filled", color: "dark" }).background!,
      0.1
    ),

    '&:hover': {
      backgroundColor: theme.fn.lighten(
        theme.fn.variant({ variant: "filled", color: "dark" }).background!,
        0.15
      ),
    },
    '&:focus': {
      outline: '2px',
    }
  },

  shortcut: {
    fontSize: 8,
    lineHeight: 1,
    padding: 6,
    borderRadius: theme.radius.sm,
    color: true ? theme.colors.dark[0] : theme.colors.gray[7],
    backgroundColor: true ? theme.colors.dark[6] : theme.colors.gray[0],
  },
}));// theme.colorScheme === 'dark' === true