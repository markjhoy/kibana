/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { i18n } from '@kbn/i18n';
import { TutorialsCategory } from '../../services/tutorials';
import {
  onPremInstructions,
  cloudInstructions,
  onPremCloudInstructions,
} from '../instructions/filebeat_instructions';
import {
  TutorialContext,
  TutorialSchema,
} from '../../services/tutorials/lib/tutorials_registry_types';

export function activemqLogsSpecProvider(context: TutorialContext): TutorialSchema {
  const moduleName = 'activemq';
  const platforms = ['OSX', 'DEB', 'RPM', 'WINDOWS'] as const;
  return {
    id: 'activemqLogs',
    name: i18n.translate('home.tutorials.activemqLogs.nameTitle', {
      defaultMessage: 'ActiveMQ Logs',
    }),
    moduleName,
    category: TutorialsCategory.LOGGING,
    shortDescription: i18n.translate('home.tutorials.activemqLogs.shortDescription', {
      defaultMessage: 'Collect and parse logs from ActiveMQ instances with Filebeat.',
    }),
    longDescription: i18n.translate('home.tutorials.activemqLogs.longDescription', {
      defaultMessage:
        'Collect ActiveMQ logs with Filebeat. \
[Learn more]({learnMoreLink}).',
      values: {
        learnMoreLink: '{config.docs.beats.filebeat}/filebeat-module-activemq.html',
      },
    }),
    euiIconType: context.staticAssets.getPluginAssetHref('/logos/activemq.svg'),
    artifacts: {
      dashboards: [
        {
          id: 'ffe86390-145f-11ea-8fd8-030a13064883',
          linkLabel: i18n.translate('home.tutorials.activemqLogs.artifacts.dashboards.linkLabel', {
            defaultMessage: 'ActiveMQ Audit Events',
          }),
          isOverview: false,
        },
      ],
      exportedFields: {
        documentationUrl: '{config.docs.beats.filebeat}/exported-fields-activemq.html',
      },
    },
    completionTimeMinutes: 10,
    previewImagePath: context.staticAssets.getPluginAssetHref('/activemq_logs/screenshot.webp'),
    onPrem: onPremInstructions(moduleName, platforms, context),
    elasticCloud: cloudInstructions(moduleName, platforms, context),
    onPremElasticCloud: onPremCloudInstructions(moduleName, platforms, context),
    integrationBrowserCategories: ['observability'],
  };
}
