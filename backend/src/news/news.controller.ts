import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ContentStatus } from '@prisma/client';
import { NewsService } from './news.service';
import { NewsCategoriesService } from './news-categories.service';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user.type';

@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly commentsService: CommentsService,
  ) {}

  @Get()
  findAll(
    @Query('status') status?: ContentStatus,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.newsService.findAll(status, categoryId);
  }

  @Get('published')
  findPublished(@Query('categoryId') categoryId?: string) {
    return this.newsService.findPublished(categoryId);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.newsService.findBySlug(slug);
  }

  @Get(':newsId/comments')
  findComments(@Param('newsId') newsId: string) {
    return this.commentsService.findByNews(newsId);
  }

  @Post(':newsId/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createComment(
    @Param('newsId') newsId: string,
    @Body('content') content: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.commentsService.create(newsId, user, content);
  }

  @Delete('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  removeComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.commentsService.remove(commentId, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('news.manage')
  @ApiBearerAuth()
  create(@Body() body: Record<string, unknown>, @CurrentUser() user: AuthUser) {
    return this.newsService.create({ ...body, authorId: user.id } as never);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('news.manage')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.newsService.update(id, body);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('news.approve')
  @ApiBearerAuth()
  updateStatus(@Param('id') id: string, @Body('status') status: ContentStatus) {
    return this.newsService.updateStatus(id, status);
  }

  @Patch(':id/submit')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('news.submit')
  @ApiBearerAuth()
  submitForReview(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.newsService.submitForReview(id, user.id);
  }

  @Patch(':id/archive')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('news.submit')
  @ApiBearerAuth()
  archiveOwn(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.newsService.archiveOwn(id, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('news.manage')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.newsService.remove(id);
  }
}

@ApiTags('news-categories')
@Controller('news-categories')
export class NewsCategoriesController {
  constructor(private readonly service: NewsCategoriesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('news.manage')
  @ApiBearerAuth()
  create(@Body() body: { name: string; slug?: string }) {
    return this.service.create(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('news.manage')
  @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; slug?: string },
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('news.manage')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
