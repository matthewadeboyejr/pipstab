/**
 * Piptab Professional Logger
 * Handles console logging and Slack notifications based on environment and severity.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogMetadata {
  [key: string]: any;
}

interface SlackMessageOptions {
  channel: 'critical' | 'security' | 'business' | 'warnings' | 'dev';
  title: string;
  message: string;
  metadata?: LogMetadata;
  color?: string;
}

class Logger {
  // Webhook URLs
  private webhooks = {
    critical: process.env.SLACK_WEBHOOK_URL_CRITICAL,
    security: process.env.SLACK_WEBHOOK_URL_SECURITY,
    business: process.env.SLACK_WEBHOOK_URL_BUSINESS,
    warnings: process.env.SLACK_WEBHOOK_URL_WARNINGS,
    dev: process.env.SLACK_WEBHOOK_URL_DEV,
  };

  /**
   * Sanitizes metadata to remove sensitive information
   */
  private sanitize(data: LogMetadata): LogMetadata {
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'cvv', 'card', 'auth'];
    const sanitized = { ...data };

    for (const key in sanitized) {
      if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitize(sanitized[key]);
      }
    }
    return sanitized;
  }

  /**
   * Sends a formatted message to Slack
   */
  private async sendToSlack(options: SlackMessageOptions) {
    const webhookUrl = this.webhooks[options.channel];
    
    // If no webhook is configured, just log to console
    if (!webhookUrl) {
      return;
    }

    const sanitizedMetadata = options.metadata ? this.sanitize(options.metadata) : null;


    const payload = {
      attachments: [
        {
          color: options.color || '#36a64f',
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: `🔔 ${options.title}`,
                emoji: true
              }
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Message:*\n${options.message}`
              }
            },
            ...(sanitizedMetadata ? [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*Metadata:*\n\`\`\`${JSON.stringify(sanitizedMetadata, null, 2)}\`\`\``
                }
              }
            ] : []),
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: `*Env:* ${process.env.NODE_ENV || 'development'} | *Time:* ${new Date().toISOString()}`
                }
              ]
            }
          ]
        }
      ]
    };

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Failed to send log to Slack:', error);
    }
  }

  // --- Public Logging Methods ---

  /**
   * For general development debugging
   */
  async dev(title: string, message: string, metadata?: LogMetadata) {
    console.log(`[DEV] ${title}: ${message}`);
    await this.sendToSlack({
      channel: 'dev',
      title: `🛠 Dev: ${title}`,
      message,
      metadata,
      color: '#6b7280' // Gray
    });
  }

  /**
   * For non-critical system info (Signups, feature usage)
   */
  async info(title: string, message: string, metadata?: LogMetadata) {
    console.log(`[INFO] ${title}: ${message}`);
    await this.sendToSlack({
      channel: 'business',
      title: `Info: ${title}`,
      message,
      metadata,
      color: '#3b82f6' // Blue
    });
  }

  /**
   * For authentication and security events
   */
  async security(title: string, message: string, metadata?: LogMetadata) {
    console.warn(`[SECURITY] ${title}: ${message}`);
    await this.sendToSlack({
      channel: 'security',
      title: `🔐 Security: ${title}`,
      message,
      metadata,
      color: '#f59e0b' // Amber
    });
  }

  /**
   * For non-fatal errors or warnings
   */
  async warn(title: string, message: string, metadata?: LogMetadata) {
    console.warn(`[WARN] ${title}: ${message}`);
    await this.sendToSlack({
      channel: 'warnings',
      title: `⚠️ Warning: ${title}`,
      message,
      metadata,
      color: '#fbbf24' // Yellow
    });
  }

  /**
   * For system-critical failures (errors, API crashes)
   */
  async error(title: string, message: string, metadata?: LogMetadata) {
    console.error(`[ERROR] ${title}: ${message}`);
    await this.sendToSlack({
      channel: 'critical',
      title: `🚨 Error: ${title}`,
      message,
      metadata,
      color: '#ef4444' // Red
    });
  }

  /**
   * For fatal outages (Database down, etc.)
   */
  async fatal(title: string, message: string, metadata?: LogMetadata) {
    console.error(`[FATAL] ${title}: ${message}`);
    await this.sendToSlack({
      channel: 'critical',
      title: `🔥 FATAL: ${title}`,
      message,
      metadata,
      color: '#000000' // Black
    });
  }
}

export const logger = new Logger();
