/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { EuiFilterButtonProps } from '@elastic/eui';
import { mountWithIntl } from '@kbn/test-jest-helpers';
import React from 'react';
import { ThemeProvider } from 'styled-components';

import { TimelineType } from '../../../../../common/api/timeline';

import { SearchRow } from '.';

import * as i18n from '../translations';
import { getMockTheme } from '../../../../common/lib/kibana/kibana_react.mock';

const mockTheme = getMockTheme({
  eui: {
    euiSizeL: '10px',
  },
});

describe('SearchRow', () => {
  test('it renders a search input with the expected placeholder when the query is empty', () => {
    const wrapper = mountWithIntl(
      <ThemeProvider theme={mockTheme}>
        <SearchRow
          onlyFavorites={false}
          onQueryChange={jest.fn()}
          onToggleOnlyFavorites={jest.fn()}
          query=""
          timelineType={TimelineType.default}
        />
      </ThemeProvider>
    );

    expect(wrapper.find('input').first().props()).toHaveProperty(
      'placeholder',
      i18n.SEARCH_PLACEHOLDER
    );
  });

  describe('Only Favorites Button', () => {
    test('it renders the expected button text', () => {
      const wrapper = mountWithIntl(
        <ThemeProvider theme={mockTheme}>
          <SearchRow
            onlyFavorites={false}
            onQueryChange={jest.fn()}
            onToggleOnlyFavorites={jest.fn()}
            query=""
            timelineType={TimelineType.default}
          />
        </ThemeProvider>
      );

      expect(wrapper.find('[data-test-subj="only-favorites-toggle"]').first().text()).toEqual(
        i18n.ONLY_FAVORITES
      );
    });

    test('it invokes onToggleOnlyFavorites when clicked', () => {
      const onToggleOnlyFavorites = jest.fn();

      const wrapper = mountWithIntl(
        <ThemeProvider theme={mockTheme}>
          <SearchRow
            onlyFavorites={false}
            onQueryChange={jest.fn()}
            onToggleOnlyFavorites={onToggleOnlyFavorites}
            query=""
            timelineType={TimelineType.default}
          />
        </ThemeProvider>
      );

      wrapper.find('[data-test-subj="only-favorites-toggle"]').first().simulate('click');

      expect(onToggleOnlyFavorites).toHaveBeenCalled();
    });

    test('it sets the button to the toggled state when onlyFavorites is true', () => {
      const wrapper = mountWithIntl(
        <ThemeProvider theme={mockTheme}>
          <SearchRow
            onlyFavorites={true}
            onQueryChange={jest.fn()}
            onToggleOnlyFavorites={jest.fn()}
            query=""
            timelineType={TimelineType.default}
          />
        </ThemeProvider>
      );

      const props = wrapper
        .find('[data-test-subj="only-favorites-toggle"]')
        .first()
        .props() as EuiFilterButtonProps;

      expect(props.hasActiveFilters).toBe(true);
    });

    test('it sets the button to the NON-toggled state when onlyFavorites is false', () => {
      const wrapper = mountWithIntl(
        <ThemeProvider theme={mockTheme}>
          <SearchRow
            onlyFavorites={false}
            onQueryChange={jest.fn()}
            onToggleOnlyFavorites={jest.fn()}
            query=""
            timelineType={TimelineType.default}
          />
        </ThemeProvider>
      );

      const props = wrapper
        .find('[data-test-subj="only-favorites-toggle"]')
        .first()
        .props() as EuiFilterButtonProps;

      expect(props.hasActiveFilters).toBe(false);
    });
  });

  describe('#onQueryChange', () => {
    const onQueryChange = jest.fn();

    test('it invokes onQueryChange when the user enters a query', () => {
      const wrapper = mountWithIntl(
        <ThemeProvider theme={mockTheme}>
          <SearchRow
            onlyFavorites={false}
            onQueryChange={onQueryChange}
            onToggleOnlyFavorites={jest.fn()}
            query=""
            timelineType={TimelineType.default}
          />
        </ThemeProvider>
      );

      wrapper
        .find('[data-test-subj="search-bar"] input')
        .simulate('keyup', { key: 'Enter', target: { value: 'abcd' } });

      expect(onQueryChange).toHaveBeenCalled();
    });
  });
});
