/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import moment from 'moment';
import type { GetStepsData } from './helpers';
import {
  getDefineStepsData,
  getScheduleStepsData,
  getStepsData,
  getAboutStepsData,
  getActionsStepsData,
  getHumanizedDuration,
  getModifiedAboutDetailsData,
  getPrePackagedTimelineInstallationStatus,
  determineDetailsValue,
  fillEmptySeverityMappings,
} from './helpers';
import {
  mockRuleWithEverything,
  mockRule,
} from '../../../../detection_engine/rule_management_ui/components/rules_table/__mocks__/mock';
import { FilterStateStore } from '@kbn/es-query';
import { AlertSuppressionMissingFieldsStrategy } from '../../../../../common/api/detection_engine/model/rule_schema';

import type { Rule } from '../../../../detection_engine/rule_management/logic';
import type {
  AboutStepRule,
  AboutStepRuleDetails,
  DefineStepRule,
  ScheduleStepRule,
  ActionsStepRule,
} from './types';
import { getThreatMock } from '../../../../../common/detection_engine/schemas/types/threat.mock';
import type { RuleAlertAction } from '../../../../../common/detection_engine/types';

describe('rule helpers', () => {
  moment.suppressDeprecationWarnings = true;
  describe('getStepsData', () => {
    test('returns object with about, define, schedule and actions step properties formatted', () => {
      const {
        defineRuleData,
        modifiedAboutRuleDetailsData,
        aboutRuleData,
        scheduleRuleData,
        ruleActionsData,
      }: GetStepsData = getStepsData({
        rule: mockRuleWithEverything('test-id'),
      });
      const defineRuleStepData = {
        ruleType: 'saved_query',
        anomalyThreshold: 50,
        dataSourceType: 'indexPatterns',
        dataViewId: undefined,
        index: ['auditbeat-*'],
        machineLearningJobId: [],
        shouldLoadQueryDynamically: true,
        queryBar: {
          query: {
            query: 'user.name: root or user.name: admin',
            language: 'kuery',
          },
          filters: [
            {
              $state: {
                store: FilterStateStore.GLOBAL_STATE,
              },
              meta: {
                alias: null,
                disabled: false,
                key: 'event.category',
                negate: false,
                params: {
                  query: 'file',
                },
                type: 'phrase',
              },
              query: {
                match_phrase: {
                  'event.category': 'file',
                },
              },
            },
          ],
          saved_id: 'test123',
        },
        relatedIntegrations: [],
        requiredFields: [],
        threshold: {
          field: ['host.name'],
          value: '50',
          cardinality: {
            field: ['process.name'],
            value: '2',
          },
        },
        threatIndex: [],
        threatMapping: [],
        threatQueryBar: {
          query: {
            query: '',
            language: '',
          },
          filters: [],
          saved_id: null,
        },
        timeline: {
          id: '86aa74d0-2136-11ea-9864-ebc8cc1cb8c2',
          title: 'Titled timeline',
        },
        eqlOptions: {
          timestampField: undefined,
          eventCategoryField: undefined,
          tiebreakerField: undefined,
        },
        groupByFields: ['host.name'],
        groupByDuration: {
          value: 5,
          unit: 'm',
        },
        groupByRadioSelection: 'per-rule-execution',
        newTermsFields: ['host.name'],
        historyWindowSize: '7d',
        suppressionMissingFields: expect.any(String),
      };

      const aboutRuleStepData: AboutStepRule = {
        author: [],
        description: '24/7',
        falsePositives: ['test'],
        isAssociatedToEndpointList: false,
        isBuildingBlock: false,
        license: 'Elastic License',
        name: 'Query with rule-id',
        note: '# this is some markdown documentation',
        references: ['www.test.co'],
        riskScore: { value: 21, mapping: [], isMappingChecked: false },
        ruleNameOverride: 'message',
        severity: { value: 'low', mapping: fillEmptySeverityMappings([]), isMappingChecked: false },
        tags: ['tag1', 'tag2'],
        threat: getThreatMock(),
        timestampOverride: 'event.ingested',
        timestampOverrideFallbackDisabled: false,
      };
      const scheduleRuleStepData = { from: '0s', interval: '5m' };
      const ruleActionsStepData = {
        enabled: true,
        actions: [],
        responseActions: undefined,
      };
      const aboutRuleDataDetailsData = {
        note: '# this is some markdown documentation',
        description: '24/7',
        setup: '',
      };

      expect(defineRuleData).toEqual(defineRuleStepData);
      expect(aboutRuleData).toEqual(aboutRuleStepData);
      expect(scheduleRuleData).toEqual(scheduleRuleStepData);
      expect(ruleActionsData).toEqual(ruleActionsStepData);
      expect(modifiedAboutRuleDetailsData).toEqual(aboutRuleDataDetailsData);
    });
  });

  describe('getAboutStepsData', () => {
    test('returns name, description, and note as empty string if detailsView is true', () => {
      const result: AboutStepRule = getAboutStepsData(mockRuleWithEverything('test-id'), true);

      expect(result.name).toEqual('');
      expect(result.description).toEqual('');
      expect(result.note).toEqual('');
    });

    test('returns note as empty string if property does not exist on rule', () => {
      const mockedRule = mockRuleWithEverything('test-id');
      delete mockedRule.note;
      const result: AboutStepRule = getAboutStepsData(mockedRule, false);

      expect(result.note).toEqual('');
    });
  });

  describe('determineDetailsValue', () => {
    test('returns name, description, and note as empty string if detailsView is true', () => {
      const result: Pick<Rule, 'name' | 'description' | 'note'> = determineDetailsValue(
        mockRuleWithEverything('test-id'),
        true
      );
      const expected = { name: '', description: '', note: '' };

      expect(result).toEqual(expected);
    });

    test('returns name, description, and note values if detailsView is false', () => {
      const mockedRule = mockRuleWithEverything('test-id');
      const result: Pick<Rule, 'name' | 'description' | 'note'> = determineDetailsValue(
        mockedRule,
        false
      );
      const expected = {
        name: mockedRule.name,
        description: mockedRule.description,
        note: mockedRule.note,
      };

      expect(result).toEqual(expected);
    });

    test('returns note as empty string if property does not exist on rule', () => {
      const mockedRule = mockRuleWithEverything('test-id');
      delete mockedRule.note;
      const result: Pick<Rule, 'name' | 'description' | 'note'> = determineDetailsValue(
        mockedRule,
        false
      );
      const expected = { name: mockedRule.name, description: mockedRule.description, note: '' };

      expect(result).toEqual(expected);
    });
  });

  describe('getDefineStepsData', () => {
    test('returns with saved_id if value exists on rule', () => {
      const result: DefineStepRule = getDefineStepsData(mockRule('test-id'));
      const expected = expect.objectContaining({
        ruleType: 'saved_query',
        queryBar: {
          query: {
            query: '',
            language: 'kuery',
          },
          filters: [],
          saved_id: "Garrett's IP",
        },
        shouldLoadQueryDynamically: true,
      });

      expect(result).toEqual(expected);
    });

    test('returns with saved_id of undefined if value does not exist on rule', () => {
      const mockedRule = {
        ...mockRule('test-id'),
      };
      delete mockedRule.saved_id;
      const result: DefineStepRule = getDefineStepsData(mockedRule);
      const expected = expect.objectContaining({
        ruleType: 'saved_query',
        queryBar: {
          query: {
            query: '',
            language: 'kuery',
          },
          filters: [],
          saved_id: null,
        },
        shouldLoadQueryDynamically: false,
      });

      expect(result).toEqual(expected);
    });

    test('returns timeline id and title of null if they do not exist on rule', () => {
      const mockedRule = mockRuleWithEverything('test-id');
      delete mockedRule.timeline_id;
      delete mockedRule.timeline_title;
      const result: DefineStepRule = getDefineStepsData(mockedRule);

      expect(result.timeline.id).toBeNull();
      expect(result.timeline.title).toBeNull();
    });

    describe('suppression on missing fields', () => {
      test('returns default suppress value in suppress strategy is missing', () => {
        const result: DefineStepRule = getDefineStepsData(mockRule('test-id'));
        const expected = expect.objectContaining({
          suppressionMissingFields: AlertSuppressionMissingFieldsStrategy.Suppress,
        });

        expect(result).toEqual(expected);
      });

      test('returns suppress value if rule is configured with missing_fields_strategy', () => {
        const result: DefineStepRule = getDefineStepsData({
          ...mockRule('test-id'),
          alert_suppression: {
            group_by: [],
            missing_fields_strategy: AlertSuppressionMissingFieldsStrategy.DoNotSuppress,
          },
        });
        const expected = expect.objectContaining({
          suppressionMissingFields: AlertSuppressionMissingFieldsStrategy.DoNotSuppress,
        });

        expect(result).toEqual(expected);
      });
    });
  });

  describe('getHumanizedDuration', () => {
    test('returns from as seconds if from duration is specified in seconds', () => {
      const result = getHumanizedDuration('now-62s', '1m');

      expect(result).toEqual('2s');
    });

    test('returns from as seconds if from duration is specified in seconds greater than 60', () => {
      const result = getHumanizedDuration('now-122s', '1m');

      expect(result).toEqual('62s');
    });

    test('returns from as minutes if from duration is specified in minutes', () => {
      const result = getHumanizedDuration('now-660s', '5m');

      expect(result).toEqual('6m');
    });

    test('returns from as minutes if from duration is specified in minutes greater than 60', () => {
      const result = getHumanizedDuration('now-6600s', '5m');

      expect(result).toEqual('105m');
    });

    test('returns from as hours if from duration is specified in hours', () => {
      const result = getHumanizedDuration('now-7500s', '5m');

      expect(result).toEqual('2h');
    });

    test('returns from as if from is not parsable as dateMath', () => {
      const result = getHumanizedDuration('randomstring', '5m');

      expect(result).toEqual('NaNs');
    });

    test('returns from as 5m if interval is not parsable as dateMath', () => {
      const result = getHumanizedDuration('now-300s', 'randomstring');

      expect(result).toEqual('5m');
    });
  });

  describe('getScheduleStepsData', () => {
    test('returns expected ScheduleStep rule object', () => {
      const mockedRule = {
        ...mockRule('test-id'),
      };
      const result: ScheduleStepRule = getScheduleStepsData(mockedRule);
      const expected = {
        interval: mockedRule.interval,
        from: '0s',
      };

      expect(result).toEqual(expected);
    });
  });

  describe('getActionsStepsData', () => {
    test('returns expected ActionsStepRule rule object', () => {
      const actions: RuleAlertAction[] = [
        {
          id: 'id',
          group: 'group',
          params: {},
          action_type_id: 'action_type_id',
          frequency: {
            summary: true,
            throttle: null,
            notifyWhen: 'onActiveAlert',
          },
        },
      ];
      const mockedRule = {
        ...mockRule('test-id'),
        actions,
      };
      const result: ActionsStepRule = getActionsStepsData(mockedRule);
      const expected = {
        actions: [
          {
            id: 'id',
            group: 'group',
            params: {},
            actionTypeId: 'action_type_id',
            frequency: {
              summary: true,
              throttle: null,
              notifyWhen: 'onActiveAlert',
            },
          },
        ],
        responseActions: undefined,
        enabled: mockedRule.enabled,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('getModifiedAboutDetailsData', () => {
    test('returns object with "note" and "description" being those of passed in rule', () => {
      const result: AboutStepRuleDetails = getModifiedAboutDetailsData(
        mockRuleWithEverything('test-id')
      );
      const aboutRuleDataDetailsData = {
        note: '# this is some markdown documentation',
        description: '24/7',
        setup: '',
      };

      expect(result).toEqual(aboutRuleDataDetailsData);
    });

    test('returns "note" with empty string if "note" does not exist', () => {
      const { note, ...mockRuleWithoutNote } = { ...mockRuleWithEverything('test-id') };
      const result: AboutStepRuleDetails = getModifiedAboutDetailsData(mockRuleWithoutNote);

      const aboutRuleDetailsData = {
        note: '',
        description: mockRuleWithoutNote.description,
        setup: '',
      };

      expect(result).toEqual(aboutRuleDetailsData);
    });
  });

  describe('getPrePackagedTimelineStatus', () => {
    test('timelinesNotInstalled', () => {
      const timelinesInstalled = 0;
      const timelinesNotInstalled = 1;
      const timelinesNotUpdated = 0;
      const result: string = getPrePackagedTimelineInstallationStatus(
        timelinesInstalled,
        timelinesNotInstalled,
        timelinesNotUpdated
      );

      expect(result).toEqual('timelinesNotInstalled');
    });

    test('timelinesInstalled', () => {
      const timelinesInstalled = 1;
      const timelinesNotInstalled = 0;
      const timelinesNotUpdated = 0;
      const result: string = getPrePackagedTimelineInstallationStatus(
        timelinesInstalled,
        timelinesNotInstalled,
        timelinesNotUpdated
      );

      expect(result).toEqual('timelinesInstalled');
    });

    test('someTimelineUninstall', () => {
      const timelinesInstalled = 1;
      const timelinesNotInstalled = 1;
      const timelinesNotUpdated = 0;
      const result: string = getPrePackagedTimelineInstallationStatus(
        timelinesInstalled,
        timelinesNotInstalled,
        timelinesNotUpdated
      );

      expect(result).toEqual('someTimelineUninstall');
    });

    test('timelineNeedUpdate', () => {
      const timelinesInstalled = 1;
      const timelinesNotInstalled = 0;
      const timelinesNotUpdated = 1;
      const result: string = getPrePackagedTimelineInstallationStatus(
        timelinesInstalled,
        timelinesNotInstalled,
        timelinesNotUpdated
      );

      expect(result).toEqual('timelineNeedUpdate');
    });

    test('unknown', () => {
      const timelinesInstalled = undefined;
      const timelinesNotInstalled = undefined;
      const timelinesNotUpdated = undefined;
      const result: string = getPrePackagedTimelineInstallationStatus(
        timelinesInstalled,
        timelinesNotInstalled,
        timelinesNotUpdated
      );

      expect(result).toEqual('unknown');
    });
  });
});
