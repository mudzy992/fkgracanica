export type PaypalOrder = {
  id: string;
  status: string;
  purchase_units?: { custom_id?: string }[];
  links?: { rel?: string; href?: string }[];
};

async function paypalJson<T>(url: string, init: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`PayPal ${res.status}: ${text.slice(0, 240)}`);
  }
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export async function paypalAccessToken(baseUrl: string, clientId: string, secret: string) {
  const basic = Buffer.from(`${clientId}:${secret}`).toString('base64');
  const data = await paypalJson<{ access_token: string }>(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  return data.access_token;
}

export async function paypalCreateOrder(
  baseUrl: string,
  token: string,
  body: Record<string, unknown>,
) {
  return paypalJson<PaypalOrder>(`${baseUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

export async function paypalGetOrder(baseUrl: string, token: string, orderId: string) {
  return paypalJson<PaypalOrder>(`${baseUrl}/v2/checkout/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function paypalCaptureOrder(baseUrl: string, token: string, orderId: string) {
  return paypalJson<PaypalOrder>(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: '{}',
  });
}

export async function paypalVerifyWebhook(
  baseUrl: string,
  token: string,
  payload: Record<string, unknown>,
) {
  const data = await paypalJson<{ verification_status: string }>(
    `${baseUrl}/v1/notifications/verify-webhook-signature`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );
  return data.verification_status === 'SUCCESS';
}
