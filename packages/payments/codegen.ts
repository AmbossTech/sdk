import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: '../core/schema/amboss.graphql',
  documents: ['src/operations/**/*.graphql'],
  generates: {
    'src/generated/sdk.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-graphql-request'],
      config: {
        scalars: {},
        avoidOptionals: false,
        skipTypename: true,
        enumsAsTypes: true,
        useTypeImports: true,
        rawRequest: false,
        documentMode: 'string',
      },
    },
  },
};

export default config;
