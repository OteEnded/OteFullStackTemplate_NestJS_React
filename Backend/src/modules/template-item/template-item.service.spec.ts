import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TemplateItem } from '../../database/entities/template-item.entity';
import { TemplateItemService } from './template-item.service';

/**
 * Unit test for TemplateItemService with a mocked repository — no database
 * required. This is the pattern for testing services that use TypeORM repos.
 */
describe('TemplateItemService', () => {
  let service: TemplateItemService;
  let repo: jest.Mocked<Pick<Repository<TemplateItem>, 'find' | 'findOne' | 'create' | 'save'>>;

  beforeEach(async () => {
    repo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        TemplateItemService,
        { provide: getRepositoryToken(TemplateItem), useValue: repo },
      ],
    }).compile();

    service = moduleRef.get(TemplateItemService);
  });

  const UUID = '11111111-1111-1111-1111-111111111111';

  it('findAll applies the status filter, ordering, and limit', async () => {
    repo.find.mockResolvedValue([{ uuid: UUID } as TemplateItem]);

    const rows = await service.findAll({ status: 'active', limit: 10 });

    expect(rows).toHaveLength(1);
    expect(repo.find).toHaveBeenCalledWith({
      where: { status: 'active' },
      order: { updatedAt: 'DESC' },
      take: 10,
    });
  });

  it('create applies defaults for omitted fields', async () => {
    repo.create.mockImplementation((dto) => dto as TemplateItem);
    repo.save.mockImplementation(async (row) => ({ uuid: UUID, ...(row as object) }) as TemplateItem);

    await service.create({ name: 'Demo' });

    expect(repo.create).toHaveBeenCalledWith({
      name: 'Demo',
      summary: '',
      status: 'draft',
      priority: 'medium',
    });
  });

  it('update throws NotFound when the row is missing', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.update(UUID, { name: 'x' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('update merges changes and saves', async () => {
    const existing = { uuid: UUID, name: 'Old', status: 'draft' } as TemplateItem;
    repo.findOne.mockResolvedValue(existing);
    repo.save.mockImplementation(async (row) => row as TemplateItem);

    const result = await service.update(UUID, { name: 'New' });

    expect(result.name).toBe('New');
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ uuid: UUID, name: 'New' }),
    );
  });
});
