import { getStoreItem, onStoreChange, setStoreItem } from '@cromwell/core';
import { ThemeProvider, Toolbar } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import clsx from 'clsx';
import React, { Suspense, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, RouteComponentProps, Switch } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { getPageInfos } from '../../helpers/navigation';
import { useForceUpdate } from '../../helpers/forceUpdate';
import { store } from '../../redux/store';
import { LayoutPortal } from '../../helpers/LayoutPortal';
import Page404 from '../../pages/404/404page';
import PageErrorBoundary from '../errorBoundaries/PageErrorBoundary';
import FileManager from '../fileManager/FileManager';
// import LoadBox from '../loadBox/LoadBox';
import { ConfirmPrompt } from '../modal/Confirmation';
import Sidebar from '../sidebar/Sidebar';
import styles from './Layout.module.scss';
import SideNav from "../sideNav/SideNav";
import Topbar from "../topbar/Topbar";
import { ContextualBarCtx } from "src/components/topbar/context";

let userRole = getStoreItem('userInfo')?.role;

function Layout() {
  const forceUpdate = useForceUpdate();
  setStoreItem('forceUpdatePage', forceUpdate);

  onStoreChange('userInfo', (user) => {
    if (user && user.role !== userRole) {
      userRole = user.role;
      forceUpdate();
    }
  });

  useEffect(() => {
    store.setStateProp({
      prop: 'forceUpdateApp',
      payload: forceUpdate,
    });
  }, []);

  const darkMode = getStoreItem('theme')?.mode === 'dark';

  document.body.classList.remove('modeDark', 'modeLight', 'dark', 'light');
  document.body.classList.add(darkMode ? 'modeDark' : 'modeLight');
  document.body.classList.add(darkMode ? 'dark' : 'light');

  const theme = createTheme(darkMode ? {
    palette: {
      primary: {
        main: '#9747d3',
        light: '#9747d3',
        dark: '#8228c5',
      },
      secondary: {
        main: '#910081',
        light: '#910081',
        dark: '#910081',
      }
    },
  } : {
    palette: {
      primary: {
        main: '#8228c5',
        light: '#8561c5',
        dark: '#482880',
      },
      secondary: {
        main: '#910081',
        light: '#910081',
        dark: '#910081',
      }
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-screen bg-gray-100 relative dark:bg-gray-800">
        <div className="flex items-start justify-between">
        <BrowserRouter basename={'admin'}>
          <SideNav />
          <div className="flex flex-col w-full">
            {/* <Toolbar className={styles.dummyToolbar} /> */}
            <Switch>
              {getPageInfos().map(page => {
                if (page.roles && !page.roles.includes(getStoreItem('userInfo')?.role))
                  return null;
                return (
                  <Route exact={!page.baseRoute}
                    path={page.route}
                    key={page.name}
                    component={(props: RouteComponentProps) => {
                      return (
                        <PageErrorBoundary>
                          <Suspense fallback={/*<LoadBox />*/<></>}>
                            <page.component {...props} />
                          </Suspense>
                        </PageErrorBoundary>
                      )
                    }}
                  />
                )
              })}
              <Route key={'404'} >
                <Page404 />
              </Route>
            </Switch>
          </div>
        </BrowserRouter>
        {document?.body && ReactDOM.createPortal(
          <div className={styles.toastContainer} ><ToastContainer /></div>, document.body)}
        <FileManager />
        <ConfirmPrompt />
        <LayoutPortal />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default Layout;

