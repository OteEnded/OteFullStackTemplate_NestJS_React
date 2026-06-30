import { PartialType } from '@nestjs/mapped-types';
import { CreateTemplateItemDto } from './create-template-item.dto';

/**
 * All fields optional. Update semantics: only provided fields are changed
 * (sent via POST /api/template-items/:uuid).
 */
export class UpdateTemplateItemDto extends PartialType(CreateTemplateItemDto) {}
