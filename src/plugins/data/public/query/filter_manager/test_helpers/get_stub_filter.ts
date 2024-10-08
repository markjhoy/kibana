/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { Filter, FilterStateStore } from '@kbn/es-query';

export function getFilter(
  store: FilterStateStore,
  disabled: boolean,
  negated: boolean,
  queryKey: string,
  queryValue: any
): Filter {
  return {
    $state: {
      store,
    },
    meta: {
      index: 'logstash-*',
      disabled,
      negate: negated,
      alias: null,
    },
    query: {
      match: {
        [queryKey]: queryValue,
      },
    },
  };
}
