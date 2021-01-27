import { CPlugin, getRestAPIClient, LoadBox } from '@cromwell/core-frontend';
import { getStoreItem, setStoreItem } from '@cromwell/core';
import React, { useEffect, useState } from 'react';

import styles from './PluginPage.module.scss';

const PluginPage = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pluginName = urlParams.get('pluginName');
    const apiClient = getRestAPIClient();
    const [canShow, setCanShow] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const settings: any = await apiClient?.getPluginSettings(pluginName);
                if (settings) {
                    const pluginsSettings = getStoreItem('pluginsSettings') ?? {};
                    pluginsSettings[pluginName] = settings;
                    setStoreItem('pluginsSettings', pluginsSettings);
                }
            } catch (e) {
                console.error(e);
            }
            setCanShow(true);
        })()
    }, []);

    if (!canShow) return <LoadBox />

    return (
        <CPlugin id={pluginName}
            pluginName={pluginName}
            className={styles.PluginPage}
        />
    )
}

export default PluginPage;
