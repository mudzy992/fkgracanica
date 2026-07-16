import { Injectable, Logger } from '@nestjs/common';
import { JobsService } from '../jobs/jobs.module';

type DeliveryUser = {
  email: string;
  notifyEmail: boolean;
  notifyPush: boolean;
  pushDevices: { expoPushToken: string }[];
};

@Injectable()
export class NotificationDeliveryService {
  private readonly logger = new Logger(NotificationDeliveryService.name);

  constructor(private readonly jobs: JobsService) {}

  async deliver(user: DeliveryUser, notification: { title: string; body: string; type: string; path?: string }) {
    await Promise.all([
      this.sendEmail(user, notification),
      this.sendPush(user, notification),
    ]);
  }

  private async sendEmail(
    user: DeliveryUser,
    notification: { title: string; body: string },
  ) {
    if (!user.notifyEmail) return;
    await this.jobs.enqueueEmail({
      to: user.email,
      subject: notification.title,
      body: notification.body,
    });
  }

  private async sendPush(
    user: DeliveryUser,
    notification: { title: string; body: string; type: string; path?: string },
  ) {
    if (!user.notifyPush || user.pushDevices.length === 0) return;
    const messages = user.pushDevices.map((device) => ({
      to: device.expoPushToken,
      sound: 'default',
      title: notification.title,
      body: notification.body,
      data: { type: notification.type, path: notification.path },
    }));
    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });
    } catch (error) {
      this.logger.warn(`Push delivery failed: ${String(error)}`);
    }
  }
}
