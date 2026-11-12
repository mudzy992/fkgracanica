import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CommentCreateDto } from './comment-create.dto';

/**
 * BE-09b/P-B09b-8: DTO zamjenjuje `@Body('content') content: string`, koji
 * ValidationPipe nije validirao (primitivi bez metatype) — prazan komentar je
 * prolazio, a ne-string je rušio servis sa 500.
 */
const errorsFor = async (payload: unknown) => {
  const dto = plainToInstance(CommentCreateDto, payload);
  return { dto, errors: await validate(dto) };
};

describe('CommentCreateDto (BE-09b / P-B09b-8)', () => {
  it('prihvata normalan komentar i trimuje ga', async () => {
    const { dto, errors } = await errorsFor({ content: '  Bravo momci!  ' });

    expect(errors).toHaveLength(0);
    expect(dto.content).toBe('Bravo momci!');
  });

  it('odbija prazan komentar', async () => {
    const { errors } = await errorsFor({ content: '   ' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('odbija komentar kraći od 2 znaka', async () => {
    const { errors } = await errorsFor({ content: 'a' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('odbija komentar duži od 2000 znakova', async () => {
    const { errors } = await errorsFor({ content: 'x'.repeat(2001) });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('odbija ne-string sadržaj', async () => {
    const { errors } = await errorsFor({ content: { a: 1 } });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('odbija nedostajući sadržaj', async () => {
    const { errors } = await errorsFor({});
    expect(errors.length).toBeGreaterThan(0);
  });
});
