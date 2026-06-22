import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateItem } from '../../database/entities/template-item.entity';
import { TemplateItemController } from './template-item.controller';
import { TemplateItemSeeder } from './template-item.seeder';
import { TemplateItemService } from './template-item.service';

@Module({
  imports: [TypeOrmModule.forFeature([TemplateItem])],
  controllers: [TemplateItemController],
  providers: [TemplateItemService, TemplateItemSeeder],
  exports: [TemplateItemService],
})
export class TemplateItemModule {}
