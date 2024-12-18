/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import * as React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { EuiCallOut } from '@elastic/eui';

import type { CoreSetup, AppMountParameters } from '@kbn/core/public';
import type { TypedLensByValueInput } from '@kbn/lens-plugin/public';
import { KibanaRenderContextProvider } from '@kbn/react-kibana-context-render';
import type { StartDependencies } from './plugin';

export const mount =
  (coreSetup: CoreSetup<StartDependencies>) =>
  async ({ element, history }: AppMountParameters) => {
    const [core, plugins] = await coreSetup.getStartServices();
    const { App } = await import('./app');
    const preloadedVisualizationAttributes = history.location
      ?.state as TypedLensByValueInput['attributes'];

    const dataView = await plugins.data.indexPatterns.getDefault();
    const stateHelpers = await plugins.lens.stateHelperApi();

    const reactElement = (
      <KibanaRenderContextProvider
        {...{
          uiSettings: core.uiSettings,
          settings: core.settings,
          theme: core.theme,
          i18n: core.i18n,
        }}
      >
        {dataView ? (
          <App
            core={core}
            plugins={plugins}
            defaultDataView={dataView}
            stateHelpers={stateHelpers}
            preloadedVisualization={preloadedVisualizationAttributes}
          />
        ) : (
          <EuiCallOut
            title="Please define a default index pattern to use this demo"
            color="danger"
            iconType="warning"
          >
            <p>This demo only works if your default index pattern is set and time based</p>
          </EuiCallOut>
        )}
      </KibanaRenderContextProvider>
    );

    render(reactElement, element);
    return () => unmountComponentAtNode(element);
  };
