import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { CommentsService } from './comments.service';
import { NewsCategoriesService } from './news-categories.service';
import { NewsPublishScheduler } from './news-publish.scheduler';
import { NewsController, NewsCategoriesController } from './news.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [NewsController, NewsCategoriesController],
  providers: [NewsService, CommentsService, NewsCategoriesService, NewsPublishScheduler],
  exports: [NewsService, NewsCategoriesService],
})
export class NewsModule {}
