import { IsOptional, IsString } from 'class-validator';
import { PaginatedQueryDto } from '../../common/dto/paginated-query.dto';

export class MediaAssetQueryDto extends PaginatedQueryDto {
  @IsOptional()
  @IsString()
  folderId?: string;
}
