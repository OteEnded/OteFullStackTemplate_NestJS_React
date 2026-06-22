import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import {
  TEMPLATE_ITEM_PRIORITIES,
  TEMPLATE_ITEM_STATUSES,
  TemplateItemPriority,
  TemplateItemStatus,
} from '../../../database/entities/template-item.entity';

export class CreateTemplateItemDto {
  @IsString()
  @MinLength(1, { message: 'name is required' })
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  summary?: string;

  @IsOptional()
  @IsIn(TEMPLATE_ITEM_STATUSES as unknown as string[])
  status?: TemplateItemStatus;

  @IsOptional()
  @IsIn(TEMPLATE_ITEM_PRIORITIES as unknown as string[])
  priority?: TemplateItemPriority;
}
