/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { MAX_ASSIGNEES_PER_CASE } from '../constants';
import type { CaseAssignees } from '../types/domain';

export const areTotalAssigneesInvalid = (assignees?: CaseAssignees): boolean => {
  if (assignees == null) {
    return false;
  }

  return assignees.length > MAX_ASSIGNEES_PER_CASE;
};
