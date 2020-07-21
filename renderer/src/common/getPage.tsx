import React, { useState } from 'react';
import { BasePageNames, TCromwellPage, TCromwellPageCoreProps } from "@cromwell/core";
import { getStoreItem, setStoreItem } from "@cromwell/core";
import { Head } from '@cromwell/core-frontend';
import ReactHtmlParser from 'react-html-parser';
//@ts-ignore
import { importDynamicPage, importPage } from '.cromwell/imports/imports.gen';
import { checkCMSConfig } from '../helpers/checkCMSConfig';
checkCMSConfig();

function useForceUpdate() {
    const [value, setValue] = useState(0); // integer state
    return () => setValue(value => ++value); // update the state to force render
}

export const getPage = (pageName: BasePageNames | string): TCromwellPage => {
    const cmsconfig = getStoreItem('cmsconfig');
    if (!cmsconfig || !cmsconfig.themeName) {
        console.log('cmsconfig', cmsconfig)
        throw new Error('getPage !cmsconfig.themeName');
    }

    // const Page: any = importDynamicPage(pageName);
    const Page: any = importPage(pageName).default;

    return function (props: TCromwellPageCoreProps): JSX.Element {
        const { pluginsData, pageConfig, appCustomConfig, childStaticProps, appConfig, pagesInfo, ...restProps } = props;
        setStoreItem('pluginsData', pluginsData);
        setStoreItem('pageConfig', pageConfig);
        setStoreItem('appConfig', appConfig);
        setStoreItem('appCustomConfig', appCustomConfig);
        setStoreItem('pagesInfo', pagesInfo);
        const forceUpdate = useForceUpdate();
        const onCurrencyChange = (currency: string) => {
            forceUpdate();
        }
        setStoreItem('onCurrencyChange', onCurrencyChange);


        // Head SEO/meta/etc props:
        let title;
        let description;
        let headHtml;
        if (pageConfig) {
            if (pageConfig.title && pageConfig.title !== "") {
                title = pageConfig.title;
            }
            if (pageConfig.description && pageConfig.description !== "") {
                description = pageConfig.description;
            }
        }
        if (appConfig) {
            if (appConfig.headHtml && appConfig.headHtml !== "") {
                headHtml = appConfig.headHtml;
            }
        }

        // console.log('getPage: TCromwellPageCoreProps pageName', pageName, 'props', props);
        return (
            <>
                <Head>
                    <meta charSet="utf-8" />
                </Head>
                <Page {...childStaticProps} {...restProps} />
                <Head>
                    {headHtml && ReactHtmlParser(headHtml)}
                    {title && <title>{title}</title>}
                    {description && <meta property="og:description" content={description} key="description" />}
                </Head>
            </>
        )
    }
}