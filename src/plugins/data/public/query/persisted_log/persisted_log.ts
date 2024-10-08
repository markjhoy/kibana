/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import _ from 'lodash';
import * as Rx from 'rxjs';
import { map } from 'rxjs';
import { IStorageWrapper } from '@kbn/kibana-utils-plugin/public';

const defaultIsDuplicate = (oldItem: any, newItem: any) => {
  return _.isEqual(oldItem, newItem);
};

interface PersistedLogOptions<T = any> {
  maxLength?: number | string;
  filterDuplicates?: boolean;
  isDuplicate?: (oldItem: T, newItem: T) => boolean;
}

export class PersistedLog<T = any> {
  public name: string;
  public maxLength?: number;
  public filterDuplicates?: boolean;
  public isDuplicate: (oldItem: T, newItem: T) => boolean;
  public storage: IStorageWrapper;
  public items: T[];

  private update$ = new Rx.BehaviorSubject(undefined);

  constructor(name: string, options: PersistedLogOptions<T> = {}, storage: IStorageWrapper) {
    this.name = name;
    this.maxLength =
      typeof options.maxLength === 'string'
        ? (this.maxLength = parseInt(options.maxLength, 10))
        : options.maxLength;
    this.filterDuplicates = options.filterDuplicates || false;
    this.isDuplicate = options.isDuplicate || defaultIsDuplicate;
    this.storage = storage;
    this.items = this.storage.get(this.name) || [];
    if (this.maxLength !== undefined && !isNaN(this.maxLength)) {
      this.items = _.take(this.items, this.maxLength);
    }
  }

  public add(val: any) {
    if (val == null) {
      return this.items;
    }

    // remove any matching items from the stack if option is set
    if (this.filterDuplicates) {
      _.remove(this.items, (item) => {
        return this.isDuplicate(item, val);
      });
    }

    this.items.unshift(val);

    // if maxLength is set, truncate the stack
    if (this.maxLength && !isNaN(this.maxLength)) {
      this.items = _.take(this.items, this.maxLength);
    }

    // persist the stack
    this.storage.set(this.name, this.items);
    this.update$.next(undefined);
    return this.items;
  }

  public get() {
    return _.cloneDeep(this.items);
  }

  public get$() {
    return this.update$.pipe(map(() => this.get()));
  }
}
