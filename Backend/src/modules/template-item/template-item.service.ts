import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { TemplateItem } from '../../database/entities/template-item.entity';
import { CreateTemplateItemDto } from './dto/create-template-item.dto';
import { QueryTemplateItemDto } from './dto/query-template-item.dto';
import { UpdateTemplateItemDto } from './dto/update-template-item.dto';

@Injectable()
export class TemplateItemService {
  constructor(
    @InjectRepository(TemplateItem)
    private readonly repo: Repository<TemplateItem>,
  ) {}

  findAll(query: QueryTemplateItemDto): Promise<TemplateItem[]> {
    const where: FindOptionsWhere<TemplateItem> = {};
    if (query.status) {
      where.status = query.status;
    }

    return this.repo.find({
      where,
      order: { updatedAt: 'DESC' },
      take: query.limit ?? 50,
    });
  }

  async findOne(uuid: string): Promise<TemplateItem> {
    const row = await this.repo.findOne({ where: { uuid } });
    if (!row) {
      throw new NotFoundException('item not found');
    }
    return row;
  }

  create(dto: CreateTemplateItemDto): Promise<TemplateItem> {
    const row = this.repo.create({
      name: dto.name,
      summary: dto.summary ?? '',
      status: dto.status ?? 'draft',
      priority: dto.priority ?? 'medium',
    });
    return this.repo.save(row);
  }

  async update(uuid: string, dto: UpdateTemplateItemDto): Promise<TemplateItem> {
    const row = await this.findOne(uuid);
    Object.assign(row, dto);
    return this.repo.save(row);
  }
}
