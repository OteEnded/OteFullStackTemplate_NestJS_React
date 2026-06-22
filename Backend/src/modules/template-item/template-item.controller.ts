import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateTemplateItemDto } from './dto/create-template-item.dto';
import { QueryTemplateItemDto } from './dto/query-template-item.dto';
import { UpdateTemplateItemDto } from './dto/update-template-item.dto';
import { TemplateItemService } from './template-item.service';

/**
 * Example REST resource. With the global `api` prefix this is served at:
 *   GET    /api/template-items
 *   POST   /api/template-items
 *   PATCH  /api/template-items/:id
 *
 * Responses are wrapped as `{ ok: true, data }` by the global
 * TransformInterceptor, matching the contract the React frontend expects.
 */
@Controller('template-items')
export class TemplateItemController {
  constructor(private readonly service: TemplateItemService) {}

  @Get()
  findAll(@Query() query: QueryTemplateItemDto) {
    return this.service.findAll(query);
  }

  @Post()
  create(@Body() dto: CreateTemplateItemDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTemplateItemDto,
  ) {
    return this.service.update(id, dto);
  }
}
