const regex = /^(?:(?<scope>[^@]+)\/)?(?<name>.+)$/;

export default function (text: string) {
  const matches = regex.exec(text);

  return {
    scope: matches?.groups?.['scope'],
    name: matches?.groups?.['name'],
  };
}
