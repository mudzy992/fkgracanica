import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';

/**
 * BE-09b/P-B09b-8: `@Body('content') content: string` nije prolazio kroz
 * `ValidationPipe` (primitivi se ne validiraju), pa je prazan komentar bio
 * prihvaćen, a ne-string (`{"content": {...}}`) rušio servis sa 500.
 */
export class CommentCreateDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Sadržaj komentara mora biti tekst' })
  @Length(2, 2000, {
    message: 'Komentar mora imati između 2 i 2000 znakova',
  })
  content!: string;
}
