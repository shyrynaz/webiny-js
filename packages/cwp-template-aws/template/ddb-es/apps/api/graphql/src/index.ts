import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { createHandler } from "@webiny/handler-aws/gateway";
import graphqlPlugins from "@webiny/handler-graphql";
import { createWcpContext, createWcpGraphQL } from "@webiny/api-wcp";
import i18nPlugins from "@webiny/api-i18n/graphql";
import i18nDynamoDbStorageOperations from "@webiny/api-i18n-ddb";
import {
    createPageBuilderContext,
    createPageBuilderGraphQL
} from "@webiny/api-page-builder/graphql";
import { createStorageOperations as createPageBuilderStorageOperations } from "@webiny/api-page-builder-so-ddb-es";
import pageBuilderPrerenderingPlugins from "@webiny/api-page-builder/prerendering";
import pageBuilderImportExportPlugins from "@webiny/api-page-builder-import-export/graphql";
import { createStorageOperations as createPageBuilderImportExportStorageOperations } from "@webiny/api-page-builder-import-export-so-ddb";
import prerenderingServicePlugins from "@webiny/api-prerendering-service-aws/client";
import dbPlugins from "@webiny/handler-db";
import { DynamoDbDriver } from "@webiny/db-dynamodb";
import dynamoDbPlugins from "@webiny/db-dynamodb/plugins";
import elasticsearchClientContext, {
    createElasticsearchClient,
    createGzipCompression
} from "@webiny/api-elasticsearch";
import { createFileManagerContext, createFileManagerGraphQL } from "@webiny/api-file-manager";
import { createFileManagerStorageOperations } from "@webiny/api-file-manager-ddb";
import logsPlugins from "@webiny/handler-logs";
import fileManagerS3 from "@webiny/api-file-manager-s3";
import { createFormBuilder } from "@webiny/api-form-builder";
import { createFormBuilderStorageOperations } from "@webiny/api-form-builder-so-ddb-es";
import { createHeadlessCmsContext, createHeadlessCmsGraphQL } from "@webiny/api-headless-cms";
import { createStorageOperations as createHeadlessCmsStorageOperations } from "@webiny/api-headless-cms-ddb-es";
import { createAco } from "@webiny/api-aco";
import { createAcoPageBuilderContext } from "@webiny/api-page-builder-aco";
import securityPlugins from "./security";
import tenantManager from "@webiny/api-tenant-manager";
import { createAuditLogs } from "@webiny/api-audit-logs";
/**
 * APW
 */
import { createApwGraphQL, createApwPageBuilderContext } from "@webiny/api-apw";
import { createStorageOperations as createApwSaStorageOperations } from "@webiny/api-apw-scheduler-so-ddb";

// Imports plugins created via scaffolding utilities.
import scaffoldsPlugins from "./plugins/scaffolds";

const debug = process.env.DEBUG === "true";

const documentClient = new DocumentClient({
    convertEmptyValues: true,
    region: process.env.AWS_REGION
});

const elasticsearchClient = createElasticsearchClient({
    endpoint: `https://${process.env.ELASTIC_SEARCH_ENDPOINT}`
});

export const handler = createHandler({
    plugins: [
        createWcpContext(),
        createWcpGraphQL(),
        dynamoDbPlugins(),
        logsPlugins(),
        graphqlPlugins({ debug }),
        elasticsearchClientContext(elasticsearchClient),
        dbPlugins({
            table: process.env.DB_TABLE,
            driver: new DynamoDbDriver({ documentClient })
        }),
        securityPlugins({ documentClient }),
        tenantManager(),
        i18nPlugins(),
        i18nDynamoDbStorageOperations(),
        createHeadlessCmsContext({
            storageOperations: createHeadlessCmsStorageOperations({
                documentClient,
                elasticsearch: elasticsearchClient,
                plugins: []
            })
        }),
        createHeadlessCmsGraphQL(),
        createFileManagerContext({
            storageOperations: createFileManagerStorageOperations({
                documentClient
            })
        }),
        createFileManagerGraphQL(),
        fileManagerS3(),
        prerenderingServicePlugins({
            eventBus: String(process.env.EVENT_BUS)
        }),
        createPageBuilderContext({
            storageOperations: createPageBuilderStorageOperations({
                documentClient,
                elasticsearch: elasticsearchClient,
                plugins: []
            })
        }),
        createPageBuilderGraphQL(),
        pageBuilderPrerenderingPlugins(),
        pageBuilderImportExportPlugins({
            storageOperations: createPageBuilderImportExportStorageOperations({ documentClient })
        }),
        createFormBuilder({
            storageOperations: createFormBuilderStorageOperations({
                documentClient,
                elasticsearch: elasticsearchClient
            })
        }),
        createGzipCompression(),
        createApwGraphQL(),
        createApwPageBuilderContext({
            storageOperations: createApwSaStorageOperations({ documentClient })
        }),
        createAco(),
        createAcoPageBuilderContext(),
        createAuditLogs(),
        scaffoldsPlugins()
    ],
    http: { debug }
});
