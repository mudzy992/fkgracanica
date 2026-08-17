import { parsePaypalCustomId } from './paypal-api.util';

export type PaypalWebhookEvent = {
  event_type?: string;
  resource?: {
    id?: string;
    custom_id?: string;
    supplementary_data?: { related_ids?: { order_id?: string } };
    purchase_units?: { custom_id?: string }[];
  };
};

export function extractPaypalOrderId(event: PaypalWebhookEvent) {
  const resource = event.resource;
  if (!resource) return null;
  const type = event.event_type ?? '';
  if (type.startsWith('CHECKOUT.ORDER') && resource.id) return resource.id;
  const fromSupp = resource.supplementary_data?.related_ids?.order_id;
  if (fromSupp) return fromSupp;
  return null;
}

export function extractPaypalCustomId(event: PaypalWebhookEvent) {
  const resource = event.resource;
  if (!resource) return null;
  const raw = resource.custom_id ?? resource.purchase_units?.[0]?.custom_id;
  return parsePaypalCustomId(raw);
}

export function paypalWebhookShouldCapture(eventType?: string) {
  return eventType === 'CHECKOUT.ORDER.APPROVED';
}

export function paypalWebhookShouldConfirm(eventType?: string) {
  return (
    eventType === 'CHECKOUT.ORDER.APPROVED' || eventType === 'PAYMENT.CAPTURE.COMPLETED'
  );
}
