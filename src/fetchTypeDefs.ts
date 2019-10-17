import fetch from 'isomorphic-unfetch';
import { HttpLink } from 'apollo-link-http';
import * as fs from 'fs';
import { printSchema } from 'graphql';
import { introspectSchema } from 'graphql-tools';

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
  const link = new HttpLink({ uri, fetch });

  console.log('writing typeDefs to: ', path);

  fs.writeFileSync(
    path,
    `export const typeDefs = \`
${printSchema((await introspectSchema(link)) as any).replace(/`/g, '\\`')}\``
  );
};
