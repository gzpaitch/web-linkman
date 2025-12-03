export interface WebhookResponse {
  success: boolean;
  error?: string;
}

export async function sendWebhook<T = unknown>(
  url: string,
  data: T
): Promise<WebhookResponse> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Webhook failed: ${response.status}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Webhook error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Pre-configured webhook endpoints
export const WEBHOOKS = {
  LINK_PLACES: process.env.NEXT_PUBLIC_WEBHOOK_LINK_PLACES || '',
};

export async function sendLinkPlacesWebhook<T = unknown>(data: T): Promise<WebhookResponse> {
  if (!WEBHOOKS.LINK_PLACES) {
    return { success: false, error: 'Webhook URL not configured' };
  }
  return sendWebhook(WEBHOOKS.LINK_PLACES, data);
}
