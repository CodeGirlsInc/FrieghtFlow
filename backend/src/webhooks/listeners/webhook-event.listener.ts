import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

interface WebhookEventPayload {
  id: string;
  source: string;
  eventType: string;
  eventId?: string;
  payload: any;
  headers?: Record<string, string>;
  createdAt: Date;
}

@Injectable()
export class WebhookEventListener {
  private readonly logger = new Logger(WebhookEventListener.name);

  // GitHub webhook events
  @OnEvent('webhook.github.push')
  async handleGitHubPush(payload: WebhookEventPayload) {
    this.logger.log(`Handling GitHub push event: ${payload.eventId}`);
    // Implement your GitHub push logic here
    // e.g., trigger CI/CD pipeline, update deployment status, etc.
  }

  @OnEvent('webhook.github.pull_request')
  async handleGitHubPullRequest(payload: WebhookEventPayload) {
    this.logger.log(`Handling GitHub pull request event: ${payload.eventId}`);
    // Implement your GitHub PR logic here
    // e.g., run tests, update PR status, notify reviewers, etc.
  }

  @OnEvent('webhook.github.issues')
  async handleGitHubIssues(payload: WebhookEventPayload) {
    this.logger.log(`Handling GitHub issues event: ${payload.eventId}`);
    // Implement your GitHub issues logic here
    // e.g., create internal tickets, notify team, etc.
  }

  // Stripe webhook events
  @OnEvent('webhook.stripe.payment_intent.succeeded')
  async handleStripePaymentSuccess(payload: WebhookEventPayload) {
    this.logger.log(`Handling Stripe payment success: ${payload.eventId}`);
    // Implement your payment success logic here
    // e.g., update user subscription, send confirmation email, etc.
  }

  @OnEvent('webhook.stripe.payment_intent.payment_failed')
  async handleStripePaymentFailed(payload: WebhookEventPayload) {
    this.logger.log(`Handling Stripe payment failure: ${payload.eventId}`);
    // Implement your payment failure logic here
    // e.g., notify user, retry payment, update subscription status, etc.
  }

  @OnEvent('webhook.stripe.customer.created')
  async handleStripeCustomerCreated(payload: WebhookEventPayload) {
    this.logger.log(`Handling Stripe customer created: ${payload.eventId}`);
    // Implement your customer creation logic here
    // e.g., sync customer data, send welcome email, etc.
  }

  // Generic webhook events
  @OnEvent('webhook.generic.*')
  async handleGenericWebhook(payload: WebhookEventPayload) {
    this.logger.log(
      `Handling generic webhook event: ${payload.source}.${payload.eventType}`,
    );
    // Implement your generic webhook logic here
    // This will catch all generic webhook events
  }

  // Catch-all for any webhook event
  @OnEvent('webhook.**')
  async handleAnyWebhook(payload: WebhookEventPayload) {
    this.logger.debug(
      `Webhook event received: ${payload.source}.${payload.eventType}`,
    );
    // This will log all webhook events for debugging
    // You can implement global webhook processing logic here
  }
}
