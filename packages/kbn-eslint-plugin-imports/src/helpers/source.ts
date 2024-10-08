/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { Rule } from 'eslint';

/**
 * Get the path of the sourcefile being linted
 */
export function getSourcePath(context: Rule.RuleContext) {
  const sourceFilename = context.getPhysicalFilename
    ? context.getPhysicalFilename()
    : context.getFilename();

  if (!sourceFilename) {
    throw new Error('unable to determine sourceFilename for file being linted');
  }

  return sourceFilename;
}
