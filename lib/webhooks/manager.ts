import crypto from 'crypto';
import db from '@/lib/db';

export interface Webhook {
  id: number;
  name: string;
  url: string;
  events: string[];
  secret?: string;
  is_active: boolean;
  headers?: Record<string, string>;
  retry_count: number;
  timeout: number;
  created_at: string;
  updated_at: string;
}

export interface WebhookEvent {
  id: string;
  webhook_id: number;
  event_type: string;
  payload: any;
  status: 'pending' | 'success' | 'failed';
  attempts: number;
  last_attempt_at?: string;
  response_status?: number;
  response_body?: string;
  error_message?: string;
  created_at: string;
}

export interface WebhookDelivery {
  success: boolean;
  status?: number;
  response?: any;
  error?: string;
  attempts: number;
}

export class WebhookManager {
  private static instance: WebhookManager;
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  static getInstance(): WebhookManager {
    if (!WebhookManager.instance) {
      WebhookManager.instance = new WebhookManager();
      WebhookManager.instance.initializeDatabase();
    }
    return WebhookManager.instance;
  }

  private initializeDatabase() {
    // Create webhooks table
    db.exec(`
      CREATE TABLE IF NOT EXISTS webhooks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        events TEXT NOT NULL,
        secret TEXT,
        is_active BOOLEAN DEFAULT 1,
        headers TEXT,
        retry_count INTEGER DEFAULT 3,
        timeout INTEGER DEFAULT 30000,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS webhook_events (
        id TEXT PRIMARY KEY,
        webhook_id INTEGER NOT NULL,
        event_type TEXT NOT NULL,
        payload TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        attempts INTEGER DEFAULT 0,
        last_attempt_at DATETIME,
        response_status INTEGER,
        response_body TEXT,
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (webhook_id) REFERENCES webhooks (id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events (status);
      CREATE INDEX IF NOT EXISTS idx_webhook_events_webhook_id ON webhook_events (webhook_id);
    `);
  }

  // Create a new webhook
  createWebhook(webhook: Omit<Webhook, 'id' | 'created_at' | 'updated_at'>): Webhook {
    const stmt = db.prepare(`
      INSERT INTO webhooks (name, url, events, secret, is_active, headers, retry_count, timeout)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      webhook.name,
      webhook.url,
      JSON.stringify(webhook.events),
      webhook.secret,
      webhook.is_active ? 1 : 0,
      webhook.headers ? JSON.stringify(webhook.headers) : null,
      webhook.retry_count,
      webhook.timeout
    );

    const webhookId = (await result).lastInsertRowid;
    return this.getWebhook(Number(webhookId))!;
  }

  // Get webhook by ID
  getWebhook(id: number): Webhook | null {
    const stmt = db.prepare('SELECT * FROM webhooks WHERE id = ?');
    const row = stmt.get(id) as any;
    
    if (!row) return null;

    return {
      ...row,
      events: JSON.parse(row.events),
      headers: row.headers ? JSON.parse(row.headers) : undefined,
      is_active: Boolean(row.is_active),
    };
  }

  // Get all webhooks
  getAllWebhooks(): Webhook[] {
    const stmt = db.prepare('SELECT * FROM webhooks ORDER BY created_at DESC');
    const rows = stmt.all() as any[];

    return rows.map(row => ({
      ...row,
      events: JSON.parse(row.events),
      headers: row.headers ? JSON.parse(row.headers) : undefined,
      is_active: Boolean(row.is_active),
    }));
  }

  // Get webhooks for a specific event
  getWebhooksForEvent(eventType: string): Webhook[] {
    const allWebhooks = this.getAllWebhooks();
    return allWebhooks.filter(
      webhook => webhook.is_active && webhook.events.includes(eventType)
    );
  }

  // Update webhook
  updateWebhook(id: number, updates: Partial<Webhook>): Webhook | null {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.url !== undefined) {
      fields.push('url = ?');
      values.push(updates.url);
    }
    if (updates.events !== undefined) {
      fields.push('events = ?');
      values.push(JSON.stringify(updates.events));
    }
    if (updates.secret !== undefined) {
      fields.push('secret = ?');
      values.push(updates.secret);
    }
    if (updates.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(updates.is_active ? 1 : 0);
    }
    if (updates.headers !== undefined) {
      fields.push('headers = ?');
      values.push(JSON.stringify(updates.headers));
    }
    if (updates.retry_count !== undefined) {
      fields.push('retry_count = ?');
      values.push(updates.retry_count);
    }
    if (updates.timeout !== undefined) {
      fields.push('timeout = ?');
      values.push(updates.timeout);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`UPDATE webhooks SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return this.getWebhook(id);
  }

  // Delete webhook
  deleteWebhook(id: number): boolean {
    const stmt = db.prepare('DELETE FROM webhooks WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Trigger webhooks for an event
  async trigger(eventType: string, payload: any): Promise<WebhookDelivery[]> {
    const webhooks = this.getWebhooksForEvent(eventType);
    
    if (webhooks.length === 0) {
      console.log(`No webhooks registered for event: ${eventType}`);
      return [];
    }

    const deliveries = await Promise.all(
      webhooks.map(webhook => this.deliverWebhook(webhook, eventType, payload))
    );

    return deliveries;
  }

  // Deliver webhook with retry logic
  private async deliverWebhook(
    webhook: Webhook,
    eventType: string,
    payload: any
  ): Promise<WebhookDelivery> {
    const eventId = crypto.randomUUID();
    
    // Create event record
    this.createWebhookEvent(eventId, webhook.id, eventType, payload);

    let lastError: string | undefined;
    let lastStatus: number | undefined;
    let lastResponse: any;

    for (let attempt = 1; attempt <= (webhook.retry_count || this.maxRetries); attempt++) {
      try {
        const result = await this.sendWebhookRequest(webhook, eventType, payload);
        
        // Update event record
        this.updateWebhookEvent(eventId, {
          status: 'success',
          attempts: attempt,
          last_attempt_at: new Date().toISOString(),
          response_status: result.status,
          response_body: JSON.stringify(result.response),
        });

        return {
          success: true,
          status: result.status,
          response: result.response,
          attempts: attempt,
        };
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        lastStatus = (error as any).status;
        lastResponse = (error as any).response;

        console.error(
          `Webhook delivery attempt ${attempt}/${webhook.retry_count} failed for ${webhook.url}:`,
          lastError
        );

        // Update event record
        this.updateWebhookEvent(eventId, {
          status: attempt === webhook.retry_count ? 'failed' : 'pending',
          attempts: attempt,
          last_attempt_at: new Date().toISOString(),
          response_status: lastStatus,
          error_message: lastError,
        });

        // Wait before retrying (exponential backoff)
        if (attempt < webhook.retry_count) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, attempt - 1)));
        }
      }
    }

    return {
      success: false,
      error: lastError,
      status: lastStatus,
      attempts: webhook.retry_count || this.maxRetries,
    };
  }

  // Send webhook HTTP request
  private async sendWebhookRequest(
    webhook: Webhook,
    eventType: string,
    payload: any
  ): Promise<{ status: number; response: any }> {
    const body = JSON.stringify({
      event: eventType,
      data: payload,
      timestamp: new Date().toISOString(),
      webhook_id: webhook.id,
    });

    // Generate signature
    const signature = webhook.secret
      ? crypto.createHmac('sha256', webhook.secret).update(body).digest('hex')
      : undefined;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'EmscaleCMS-Webhook/1.0',
      ...(webhook.headers || {}),
    };

    if (signature) {
      headers['X-Webhook-Signature'] = signature;
      headers['X-Webhook-Signature-Algorithm'] = 'sha256';
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), webhook.timeout || 30000);

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const responseData = await response.text();
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseData);
      } catch {
        parsedResponse = responseData;
      }

      if (!response.ok) {
        throw {
          status: response.status,
          response: parsedResponse,
          message: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        status: response.status,
        response: parsedResponse,
      };
    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  }

  // Create webhook event record
  private createWebhookEvent(
    id: string,
    webhookId: number,
    eventType: string,
    payload: any
  ): void {
    const stmt = db.prepare(`
      INSERT INTO webhook_events (id, webhook_id, event_type, payload)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(id, webhookId, eventType, JSON.stringify(payload));
  }

  // Update webhook event record
  private updateWebhookEvent(id: string, updates: Partial<WebhookEvent>): void {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.attempts !== undefined) {
      fields.push('attempts = ?');
      values.push(updates.attempts);
    }
    if (updates.last_attempt_at !== undefined) {
      fields.push('last_attempt_at = ?');
      values.push(updates.last_attempt_at);
    }
    if (updates.response_status !== undefined) {
      fields.push('response_status = ?');
      values.push(updates.response_status);
    }
    if (updates.response_body !== undefined) {
      fields.push('response_body = ?');
      values.push(updates.response_body);
    }
    if (updates.error_message !== undefined) {
      fields.push('error_message = ?');
      values.push(updates.error_message);
    }

    values.push(id);

    const stmt = db.prepare(`UPDATE webhook_events SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);
  }

  // Get webhook events
  getWebhookEvents(webhookId: number, limit = 50): WebhookEvent[] {
    const stmt = db.prepare(`
      SELECT * FROM webhook_events
      WHERE webhook_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);

    const rows = stmt.all(webhookId, limit) as any[];

    return rows.map(row => ({
      ...row,
      payload: JSON.parse(row.payload),
    }));
  }

  // Verify webhook signature
  verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  // Get webhook statistics
  getWebhookStats(webhookId: number): {
    total: number;
    success: number;
    failed: number;
    pending: number;
    successRate: number;
  } {
    const stmt = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
      FROM webhook_events
      WHERE webhook_id = ?
    `);

    const stats = stmt.get(webhookId) as any;

    return {
      total: stats.total || 0,
      success: stats.success || 0,
      failed: stats.failed || 0,
      pending: stats.pending || 0,
      successRate: stats.total > 0 ? (stats.success / stats.total) * 100 : 0,
    };
  }

  // Retry failed webhook events
  async retryFailedEvents(webhookId?: number): Promise<number> {
    const query = webhookId
      ? 'SELECT * FROM webhook_events WHERE webhook_id = ? AND status = "failed"'
      : 'SELECT * FROM webhook_events WHERE status = "failed"';

    const stmt = db.prepare(query);
    const events = (webhookId ? stmt.all(webhookId) : stmt.all()) as any[];

    let retriedCount = 0;

    for (const event of events) {
      const webhook = this.getWebhook(event.webhook_id);
      if (!webhook || !webhook.is_active) continue;

      const payload = JSON.parse(event.payload);
      await this.deliverWebhook(webhook, event.event_type, payload);
      retriedCount++;
    }

    return retriedCount;
  }
}

export const webhookManager = WebhookManager.getInstance();




