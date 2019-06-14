import fetch from 'isomorphic-unfetch';
import { HttpLink } from 'apollo-link-http';
import * as fs from 'fs';
import { printSchema } from 'graphql';
import { introspectSchema } from 'graphql-tools';

export const fetchTypeDefs = async ({
  uri = 'http://localhost:4000/graphql',
  typescript = true,
}) => {
  const link = new HttpLink({ uri, fetch });

  const path = process.cwd() + `/typeDefs.${typescript ? 'ts' : 'js'}`;

  console.log('writing typeDefs to: ', path);

  fs.writeFileSync(
    path,
    `export const typeDefs = \`
${printSchema((await introspectSchema(link)) as any).replace(/`/g, '\\`')}\``
  );
};
