import {
  ActionIcon,
  Anchor,
  Box,
  Button,
  Container,
  Group,
  NativeSelect,
  Text,
  TextInput,
} from '@mantine/core';
import { useInputState, useToggle } from '@mantine/hooks';
import { FiSliders } from 'react-icons/fi';
import { isString } from 'lodash';
import {
  ActionFunction,
  Form,
  LinksFunction,
  MetaFunction,
  redirect,
  useActionData,
  useTransition,
} from 'remix';
import sanitize from 'sanitize.css';
import GhCorner from '~/components/gh-corner';
import search, { scopes } from '~/utils/search';
import Settings from '~/components/settings';

export const meta: MetaFunction = () => ({
  'og:title': 'git.pizza',
  'og:description': "Find any package's repository, now.",
  'og:url': 'https://git.pizza',
  'og:image': 'https://git.pizza/logo.png',
  'og:site_name': 'git.pizza',
  'og:locale': 'en_US',
  'og:type': 'website',
  'twitter:card': 'summary_large_image',
  'twitter:title': 'git.pizza',
  'twitter:description': "Find any package's repository, now.",
  'twitter:image': 'https://git.pizza/logo.png',
  'twitter:creator': '@knpwrs',
});

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
  const [scopeValue, setScopeValue] = useInputState('');
  const [nameValue, setNameValue] = useInputState('');
  const [settingsOpened, toggleSettingsOpened] = useToggle(false, [
    true,
    false,
  ]);
  const transition = useTransition();
  const actionData = useActionData() ?? {};
  const busy = transition.state === 'submitting';
  const url = nameValue
    ? `https://git.pizza/${scopeValue ? `${scopeValue}/` : ''}${nameValue}`
    : '';

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
          <ActionIcon onClick={() => toggleSettingsOpened()}>
            <FiSliders />
          </ActionIcon>
          <Settings opened={settingsOpened} onClose={toggleSettingsOpened} />
          <NativeSelect
            name="scope"
            data={scopes}
            value={scopeValue}
            onChange={setScopeValue}
          />
          <TextInput
            name="name"
            placeholder="Package Name"
            value={nameValue}
            onChange={setNameValue}
            error={actionData?.nameError}
            required
          />
          <Button type="submit" disabled={busy}>
            Go!
          </Button>
        </Group>
      </Form>
      {url ? (
        <Container sx={{ paddingTop: 50 }}>
          <Anchor href={url}>
            <Text size="lg" weight="bolder">
              {url}
            </Text>
          </Anchor>
        </Container>
      ) : null}
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
        <GhCorner />
      </Container>
    </Box>
  );
}
