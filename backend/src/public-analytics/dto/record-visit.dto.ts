import { IsIn, IsString, MaxLength } from 'class-validator';

export class RecordVisitDto {
  @IsIn(['web', 'mobile'])
  platform!: 'web' | 'mobile';

  @IsString()
  @MaxLength(512)
  visitorId!: string;
}
