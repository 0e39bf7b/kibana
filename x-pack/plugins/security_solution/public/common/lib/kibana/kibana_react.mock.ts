/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/* eslint-disable react/display-name */

import React from 'react';
import type { RecursivePartial } from '@elastic/eui/src/components/common';
import { unifiedSearchPluginMock } from '@kbn/unified-search-plugin/public/mocks';
import { navigationPluginMock } from '@kbn/navigation-plugin/public/mocks';
import { discoverPluginMock } from '@kbn/discover-plugin/public/mocks';
import { coreMock, themeServiceMock } from '@kbn/core/public/mocks';
import { KibanaContextProvider } from '@kbn/kibana-react-plugin/public';
import { dataPluginMock } from '@kbn/data-plugin/public/mocks';
import { securityMock } from '@kbn/security-plugin/public/mocks';
import {
  DEFAULT_APP_REFRESH_INTERVAL,
  DEFAULT_APP_TIME_RANGE,
  DEFAULT_BYTES_FORMAT,
  DEFAULT_DARK_MODE,
  DEFAULT_DATE_FORMAT,
  DEFAULT_DATE_FORMAT_TZ,
  DEFAULT_FROM,
  DEFAULT_INDEX_KEY,
  DEFAULT_INDEX_PATTERN,
  DEFAULT_INTERVAL_PAUSE,
  DEFAULT_INTERVAL_VALUE,
  DEFAULT_REFRESH_RATE_INTERVAL,
  DEFAULT_TIME_RANGE,
  DEFAULT_TO,
  DEFAULT_RULES_TABLE_REFRESH_SETTING,
  DEFAULT_RULE_REFRESH_INTERVAL_ON,
  DEFAULT_RULE_REFRESH_INTERVAL_VALUE,
  SERVER_APP_ID,
} from '../../../../common/constants';
import type { StartServices } from '../../../types';
import { createSecuritySolutionStorageMock } from '../../mock/mock_local_storage';
import { MlLocatorDefinition } from '@kbn/ml-plugin/public';
import type { EuiTheme } from '@kbn/kibana-react-plugin/common';
import { MockUrlService } from '@kbn/share-plugin/common/mocks';
import { fleetMock } from '@kbn/fleet-plugin/public/mocks';
import { mockCasesContract } from '@kbn/cases-plugin/public/mocks';
import { noCasesPermissions } from '../../../cases_test_utils';
import { triggersActionsUiMock } from '@kbn/triggers-actions-ui-plugin/public/mocks';
import { mockApm } from '../apm/service.mock';
import { cloudExperimentsMock } from '@kbn/cloud-experiments-plugin/common/mocks';
import { guidedOnboardingMock } from '@kbn/guided-onboarding-plugin/public/mocks';
import { dataViewPluginMocks } from '@kbn/data-views-plugin/public/mocks';
import { of } from 'rxjs';
import { UpsellingService } from '../upsellings';
import { cloudMock } from '@kbn/cloud-plugin/public/mocks';
import { NavigationProvider } from '@kbn/security-solution-navigation';

const mockUiSettings: Record<string, unknown> = {
  [DEFAULT_TIME_RANGE]: { from: 'now-15m', to: 'now', mode: 'quick' },
  [DEFAULT_REFRESH_RATE_INTERVAL]: { pause: false, value: 0 },
  [DEFAULT_APP_TIME_RANGE]: {
    from: DEFAULT_FROM,
    to: DEFAULT_TO,
  },
  [DEFAULT_APP_REFRESH_INTERVAL]: {
    pause: DEFAULT_INTERVAL_PAUSE,
    value: DEFAULT_INTERVAL_VALUE,
  },
  [DEFAULT_INDEX_KEY]: DEFAULT_INDEX_PATTERN,
  [DEFAULT_BYTES_FORMAT]: '0,0.[0]b',
  [DEFAULT_DATE_FORMAT_TZ]: 'UTC',
  [DEFAULT_DATE_FORMAT]: 'MMM D, YYYY @ HH:mm:ss.SSS',
  [DEFAULT_DARK_MODE]: false,
  [DEFAULT_RULES_TABLE_REFRESH_SETTING]: {
    on: DEFAULT_RULE_REFRESH_INTERVAL_ON,
    value: DEFAULT_RULE_REFRESH_INTERVAL_VALUE,
  },
};

export const createUseUiSettingMock =
  () =>
  (key: string, defaultValue?: unknown): unknown => {
    const result = mockUiSettings[key];

    if (typeof result != null) return result;

    if (defaultValue != null) {
      return defaultValue;
    }

    throw new TypeError(`Unexpected config key: ${key}`);
  };

export const createUseUiSetting$Mock = () => {
  const useUiSettingMock = createUseUiSettingMock();

  return (key: string, defaultValue?: unknown): [unknown, () => void] | undefined => [
    useUiSettingMock(key, defaultValue),
    jest.fn(),
  ];
};

export const createStartServicesMock = (
  core: ReturnType<typeof coreMock.createStart> = coreMock.createStart()
): StartServices => {
  core.uiSettings.get.mockImplementation(createUseUiSettingMock());
  core.settings.client.get.mockImplementation(createUseUiSettingMock());
  const { storage } = createSecuritySolutionStorageMock();
  const apm = mockApm();
  const data = dataPluginMock.createStartContract();
  const customDataService = dataPluginMock.createStartContract();
  const security = securityMock.createSetup();
  const urlService = new MockUrlService();
  const locator = urlService.locators.create(new MlLocatorDefinition());
  const fleet = fleetMock.createStartMock();
  const unifiedSearch = unifiedSearchPluginMock.createStartContract();
  const navigation = navigationPluginMock.createStartContract();
  const discover = discoverPluginMock.createStartContract();
  const cases = mockCasesContract();
  const dataViewServiceMock = dataViewPluginMocks.createStartContract();
  cases.helpers.getUICapabilities.mockReturnValue(noCasesPermissions());
  const triggersActionsUi = triggersActionsUiMock.createStart();
  const cloudExperiments = cloudExperimentsMock.createStartMock();
  const guidedOnboarding = guidedOnboardingMock.createStart();
  const cloud = cloudMock.createStart();

  return {
    ...core,
    apm,
    cases,
    unifiedSearch,
    navigation,
    discover,
    dataViews: dataViewServiceMock,
    data: {
      ...data,
      dataViews: {
        create: jest.fn(),
        getIdsWithTitle: jest.fn(),
        get: jest.fn(),
        getIndexPattern: jest.fn(),
        getFieldsForWildcard: jest.fn(),
        getRuntimeMappings: jest.fn(),
      },
      query: {
        ...data.query,
        savedQueries: {
          ...data.query.savedQueries,
          getAllSavedQueries: jest.fn(() =>
            Promise.resolve({
              id: '123',
              attributes: {
                total: 123,
              },
            })
          ),
          findSavedQueries: jest.fn(() =>
            Promise.resolve({
              total: 123,
              queries: [],
            })
          ),
        },
      },
      search: {
        ...data.search,
        search: jest.fn().mockImplementation(() => ({
          subscribe: jest.fn().mockImplementation(() => ({
            error: jest.fn(),
            next: jest.fn(),
            unsubscribe: jest.fn(),
          })),
          pipe: jest.fn().mockImplementation(() => ({
            subscribe: jest.fn().mockImplementation(() => ({
              error: jest.fn(),
              next: jest.fn(),
              unsubscribe: jest.fn(),
            })),
          })),
        })),
      },
    },
    application: {
      ...core.application,
      capabilities: {
        ...core.application.capabilities,
        [SERVER_APP_ID]: {
          crud: true,
          read: true,
        },
      },
    },
    security,
    storage,
    fleet,
    ml: {
      locator,
    },
    theme: {
      theme$: themeServiceMock.createTheme$(),
    },
    timelines: {
      getLastUpdated: jest.fn(),
      getFieldBrowser: jest.fn(),
      getHoverActions: jest.fn().mockReturnValue({
        getAddToTimelineButton: jest.fn(),
      }),
    },
    osquery: {
      OsqueryResults: jest.fn().mockReturnValue(null),
      fetchAllLiveQueries: jest.fn().mockReturnValue({ data: { data: { items: [] } } }),
    },
    triggersActionsUi,
    cloudExperiments,
    guidedOnboarding,
    cloud: {
      ...cloud,
      isCloudEnabled: false,
    },
    isSidebarEnabled$: of(true),
    upselling: new UpsellingService(),
    customDataService,
  } as unknown as StartServices;
};

export const createWithKibanaMock = () => {
  const services = createStartServicesMock();

  return (Component: unknown) => (props: unknown) => {
    return React.createElement(Component as string, { ...(props as object), kibana: { services } });
  };
};

export const createKibanaContextProviderMock = () => {
  const services = createStartServicesMock();

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(
      KibanaContextProvider,
      { services },
      React.createElement(NavigationProvider, { core: services }, children)
    );
};

export const getMockTheme = (partialTheme: RecursivePartial<EuiTheme>): EuiTheme =>
  partialTheme as EuiTheme;
