import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import {
  TEMPLATE_ITEM_STATUSES,
  TemplateItemStatus,
} from '../../../database/entities/template-item.entity';

export class QueryTemplateItemDto {
  @IsOptional()
  @IsIn(TEMPLATE_ITEM_STATUSES as unknown as string[])
  status?: TemplateItemStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50;
}
