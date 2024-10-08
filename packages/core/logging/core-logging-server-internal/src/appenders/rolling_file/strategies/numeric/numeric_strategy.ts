/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { basename, dirname } from 'path';
import { schema } from '@kbn/config-schema';
import type { NumericRollingStrategyConfig } from '@kbn/core-logging-server';
import { RollingStrategy } from '../strategy';
import { RollingFileContext } from '../../rolling_file_context';
import {
  shouldSkipRollout,
  getOrderedRolledFiles,
  rollCurrentFile,
  rollPreviousFilesInOrder,
} from './rolling_tasks';

export const numericRollingStrategyConfigSchema = schema.object({
  type: schema.literal('numeric'),
  pattern: schema.string({
    defaultValue: '-%i',
    validate: (pattern) => {
      if (!pattern.includes('%i')) {
        return `pattern must include '%i'`;
      }
    },
  }),
  max: schema.number({ min: 1, max: 100, defaultValue: 7 }),
});

/**
 * A rolling strategy that will suffix the file with a given pattern when rolling,
 * and will only retain a fixed amount of rolled files.
 *
 * @example
 * ```yaml
 * logging:
 *   appenders:
 *     rolling-file:
 *       type: rolling-file
 *       fileName: /kibana.log
 *       strategy:
 *         type: numeric
 *         pattern: "-%i"
 *       retention:
 *         maxFiles: 2
 * ```
 * - During the first rollover kibana.log is renamed to kibana-1.log. A new kibana.log file is created and starts
 *   being written to.
 * - During the second rollover kibana-1.log is renamed to kibana-2.log and kibana.log is renamed to kibana-1.log.
 *   A new kibana.log file is created and starts being written to.
 * - During the third and subsequent rollovers, kibana-2.log is deleted, kibana-1.log is renamed to kibana-2.log and
 *   kibana.log is renamed to kibana-1.log. A new kibana.log file is created and starts being written to.
 *
 * See {@link NumericRollingStrategyConfig} for more details.
 */
export class NumericRollingStrategy implements RollingStrategy {
  private readonly logFilePath;
  private readonly logFileBaseName;
  private readonly logFileFolder;

  constructor(
    private readonly config: NumericRollingStrategyConfig,
    private readonly context: RollingFileContext
  ) {
    this.logFilePath = this.context.filePath;
    this.logFileBaseName = basename(this.context.filePath);
    this.logFileFolder = dirname(this.context.filePath);
    context.setOrderedRolledFileFn(this.getOrderedRolledFiles.bind(this));
  }

  private async getOrderedRolledFiles() {
    return await getOrderedRolledFiles({
      logFileFolder: this.logFileFolder,
      logFileBaseName: this.logFileBaseName,
      pattern: this.config.pattern,
    });
  }

  async rollout() {
    const logFilePath = this.logFilePath;
    const logFileBaseName = this.logFileBaseName;
    const logFileFolder = this.logFileFolder;
    const pattern = this.config.pattern;

    if (await shouldSkipRollout({ logFilePath })) {
      return;
    }

    // get the files matching the pattern in the folder, and sort them by `%i` value
    const orderedFilesToRoll = await this.getOrderedRolledFiles();

    if (orderedFilesToRoll.length > 0) {
      await rollPreviousFilesInOrder({
        filesToRoll: orderedFilesToRoll,
        logFileFolder,
        logFileBaseName,
        pattern,
      });
    }

    await rollCurrentFile({ pattern, logFileBaseName, logFileFolder });

    // updates the context file info to mirror the new size and date
    // this is required for the time based policy, as the next time check
    // will be performed before the file manager updates the context itself by reopening
    // a writer to the new file.
    this.context.refreshFileInfo();
  }
}
