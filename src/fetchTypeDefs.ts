import * as fs from 'fs';
import { printSchema } from 'graphql';
import { UrlLoader, loadSchema } from 'graphql-tools';

interface FetchTypeDefOptions {
  uri: string;
  typescript: boolean;
  path: string;
}

export const fetchTypeDefs = async ({
  uri = 'http://localhost:4000/graphql',
  typescript = true,
  path = `${process.cwd()}/typeDefs.${typescript ? 'ts' : 'js'}`,
}: FetchTypeDefOptions) => {
  console.log('writing typeDefs to: ', path);

  // see https://www.graphql-tools.com/docs/schema-loading for more customization options
  const schema = await loadSchema(uri, {
    loaders: [new UrlLoader()],
  });

  fs.writeFileSync(
    path,
    `export const typeDefs = \`
${printSchema(schema).replace(/`/g, '\\`')}\``
  );
};
