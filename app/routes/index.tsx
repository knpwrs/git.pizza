import {
  Anchor,
  Box,
  Button,
  Container,
  Group,
  NativeSelect,
  Text,
  TextInput,
} from '@mantine/core';
import { isString } from 'lodash';
import {
  ActionFunction,
  Form,
  LinksFunction,
  redirect,
  useActionData,
  useTransition,
} from 'remix';
import sanitize from 'sanitize.css';
import search, { scopes } from '~/utils/search';

export const links: LinksFunction = () => [
  {
    rel: 'stylesheet',
    href: sanitize,
  },
  {
    rel: 'preload',
    href: '/logo.svg',
    as: 'image',
    type: 'image/svg+xml',
  },
];

export const action: ActionFunction = async ({ request }) => {
  const data = await request.formData();
  const scope = data.get('scope') ?? '';
  const name = data.get('name');

  if (!isString(scope) || !isString(name)) {
    return { scopeError: !scope, nameError: !name };
  }

  const { repo = '/' } = (await search(name, scope)) ?? {};

  return redirect(repo);
};

export default function MyApp() {
  const { state } = useTransition();
  const actionData = useActionData() ?? {};
  const busy = state === 'submitting';

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <Box
        component="img"
        src="/logo.svg"
        sx={{ width: '256px', height: '256px' }}
        alt="git.pizza logo"
      />
      <Form method="post">
        <Group spacing="xs">
          <NativeSelect name="scope" data={scopes} />
          <TextInput
            name="name"
            placeholder="Package Name"
            error={actionData?.nameError}
            required
          />
          <Button type="submit" disabled={busy}>
            Go!
          </Button>
        </Group>
      </Form>
      <Container
        size="sm"
        padding="sm"
        sx={{ marginTop: 'auto', textAlign: 'center' }}
      >
        <Text size="xs" color="gray">
          Made by{' '}
          <Anchor href="https://knpw.rs" size="xs">
            Ken Powers
          </Anchor>
          . &copy;{' '}
          <Anchor
            href="https://www.gotquestions.org/what-is-the-gospel.html"
            size="xs"
          >
            Year of Our Lord
          </Anchor>{' '}
          2022. Git Logo by{' '}
          <Anchor href="https://twitter.com/jasonlong" size="xs">
            Jason Long
          </Anchor>{' '}
          is licensed under the{' '}
          <Anchor href="https://creativecommons.org/licenses/by/3.0/" size="xs">
            Creative Commons Attribution 3.0 Unported License
          </Anchor>
          . Pizza Icon from{' '}
          <Anchor href="https://openmoji.org/" size="xs">
            OpenMoji
          </Anchor>{' '}
          is licensed under the{' '}
          <Anchor
            href="https://creativecommons.org/licenses/by-sa/4.0/"
            size="xs"
          >
            Creative Commons Attribution-ShareAlike 4.0 International License
          </Anchor>
          .
        </Text>
      </Container>
    </Box>
  );
}
