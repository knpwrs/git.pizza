import { Button } from '@mantine/core';
import { LinksFunction } from 'remix';
import sanitize from 'sanitize.css';

export const links: LinksFunction = () => [
  {
    rel: 'stylesheet',
    href: sanitize,
  },
];

export default function MyApp() {
  return <Button>Hello world!</Button>;
}
