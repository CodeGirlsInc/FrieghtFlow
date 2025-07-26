import { Injectable } from '@nestjs/common';
import type {
  WebhookSourceConfig,
  WebhookSourceValidator,
} from './interfaces/webhook-source.interface';
import { GitHubWebhookValidator } from './validators/github-webhook.validator';
import { StripeWebhookValidator } from './validators/stripe-webhook.validator';
import { GenericWebhookValidator } from './validators/generic-webhook.validator';

@Injectable()
export class WebhookSourceRegistry {
  private readonly sources = new Map<string, WebhookSourceConfig>();
  private readonly validators = new Map<string, WebhookSourceValidator>();

  constructor() {
    this.initializeDefaultSources();
  }

  private initializeDefaultSources() {
    // GitHub webhook configuration
    this.registerSource('github', {
      name: 'GitHub',
      secretKey: process.env.GITHUB_WEBHOOK_SECRET,
      signatureHeader: 'x-hub-signature-256',
      eventTypeHeader: 'x-github-event',
      eventIdHeader: 'x-github-delivery',
      validateSignature: true,
    });

    // Stripe webhook configuration
    this.registerSource('stripe', {
      name: 'Stripe',
      secretKey: process.env.STRIPE_WEBHOOK_SECRET,
      signatureHeader: 'stripe-signature',
      validateSignature: true,
    });

    // Generic webhook configuration
    this.registerSource('generic', {
      name: 'Generic',
      secretKey: process.env.GENERIC_WEBHOOK_SECRET,
      signatureHeader: 'x-signature',
      eventTypeHeader: 'x-event-type',
      eventIdHeader: 'x-event-id',
      validateSignature: false,
    });

    // Register validators
    this.validators.set('github', new GitHubWebhookValidator());
    this.validators.set('stripe', new StripeWebhookValidator());
    this.validators.set('generic', new GenericWebhookValidator());
  }

  registerSource(source: string, config: WebhookSourceConfig): void {
    this.sources.set(source, config);
  }

  getSourceConfig(source: string): WebhookSourceConfig | undefined {
    return this.sources.get(source);
  }

  getValidator(source: string): WebhookSourceValidator | undefined {
    return this.validators.get(source) || this.validators.get('generic');
  }

  getAllSources(): string[] {
    return Array.from(this.sources.keys());
  }

  isValidSource(source: string): boolean {
    return this.sources.has(source);
  }
}
