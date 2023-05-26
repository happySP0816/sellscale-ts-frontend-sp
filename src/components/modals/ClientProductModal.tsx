import {
  Button,
  Group,
  Paper,
  TextInput,
  Textarea,
  LoadingOverlay,
  rem,
  createStyles,
} from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { userTokenState } from '@atoms/userAtoms';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { addClientProduct, updateClientProduct } from '@utils/requests/clientProducts';

const useStyles = createStyles((theme) => ({
  root: {
    position: 'relative',
  },

  input: {
    height: rem(54),
    paddingTop: rem(18),
  },

  label: {
    position: 'absolute',
    pointerEvents: 'none',
    fontSize: theme.fontSizes.xs,
    paddingLeft: theme.spacing.sm,
    paddingTop: `calc(${theme.spacing.sm} / 2)`,
    zIndex: 1,
  },
}));

export default function ClientProductModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{ editProduct: any; refetch: () => void }>) {
  const [loading, setLoading] = useState(false);
  const userToken = useRecoilValue(userTokenState);
  const { classes } = useStyles();

  const form = useForm({
    initialValues: {
      name: innerProps.editProduct?.name ?? '',
      description: innerProps.editProduct?.description ?? '',
      how_it_works: innerProps.editProduct?.how_it_works ?? '',
      use_cases: innerProps.editProduct?.use_cases ?? '',
      product_url: innerProps.editProduct?.product_url ?? '',
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    let result = null;
    if (innerProps.editProduct) {
      result = await updateClientProduct(
        userToken,
        innerProps.editProduct.id,
        values.name,
        values.description,
        values.how_it_works,
        values.use_cases,
        values.product_url
      );
    } else {
      result = await addClientProduct(
        userToken,
        values.name,
        values.description,
        values.how_it_works,
        values.use_cases,
        values.product_url
      );
    }

    setLoading(false);

    if (result.status === 'success') {
      showNotification({
        id: 'new-client-product-created',
        title: 'Success',
        message: `Product successfully ${innerProps.editProduct ? 'updated' : 'created'}.`,
        color: 'blue',
        autoClose: 3000,
      });
      innerProps.refetch();
    } else {
      showNotification({
        id: 'new-client-product-created-error',
        title: 'Error Occurred',
        message: 'Please contact an administrator.',
        color: 'red',
        autoClose: false,
      });
    }

    context.closeModal(id);
  };

  return (
    <Paper
      p={0}
      style={{
        position: 'relative',
      }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <LoadingOverlay visible={loading} />

        <TextInput
          mt='md'
          label='Product Name'
          placeholder=''
          classNames={classes}
          {...form.getInputProps("name")}
        />
        <Textarea
          mt='md'
          label='Description'
          placeholder=''
          autosize
          minRows={2}
          maxRows={5}
          classNames={classes}
          {...form.getInputProps("description")}
        />
        <Textarea
          mt='md'
          label='How It Works'
          placeholder=''
          autosize
          minRows={2}
          maxRows={5}
          classNames={classes}
          {...form.getInputProps("how_it_works")}
        />
        <Textarea
          mt='md'
          label='Use Cases'
          placeholder=''
          autosize
          minRows={2}
          maxRows={5}
          classNames={classes}
          {...form.getInputProps("use_cases")}
        />

        <TextInput
          mt='md'
          label='Product URL'
          placeholder='www.example.com'
          classNames={classes}
          {...form.getInputProps("product_url")}
        />

        <Group position='center'>
        <Button
          variant='light'
          radius='md'
          type='submit'
          size='md'
          mt={10}
        >
          {innerProps.editProduct ? 'Update' : 'Create'}
        </Button>
        </Group>
      </form>
    </Paper>
  );
}
