import { BasePageNames, TCromwellPageCoreProps, StaticPageContext } from '@cromwell/core';
import { getRestAPIClient } from '@cromwell/core-frontend';

import { getThemeStaticProps } from './getThemeStaticProps';
import { pluginsDataFetcher } from './pluginsDataFetcher';

export const createGetStaticProps = (pageName: BasePageNames | string) => {
    return async function (context: StaticPageContext): Promise<
        { props: TCromwellPageCoreProps; unstable_revalidate?: number }> {
        const pluginsData = await pluginsDataFetcher(pageName, context);
        const childStaticProps = await getThemeStaticProps(pageName, context);
        const pageConfig = await getRestAPIClient().getPageConfig(pageName);
        const appConfig = await getRestAPIClient().getAppConfig();
        const appCustomConfig = await getRestAPIClient().getAppCustomConfig();
        // if (context && context.params && context.params.slug) {
        //     pageRoute += '/' + context.params.slug;
        // }
        console.log('createGetStaticProps', 'pageName', pageName, 'context', context)
        // console.log('pluginssData', pluginsData, 'childStaticProps', childStaticProps);
        return {
            props: {
                pluginsData,
                childStaticProps,
                pageConfig,
                appConfig,
                appCustomConfig
            },
            /* eslint-disable @typescript-eslint/camelcase */
            unstable_revalidate: process.env.isProd ? 1 : undefined
        }
    }
}