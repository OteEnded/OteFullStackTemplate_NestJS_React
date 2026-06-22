import { PartialType } from '@nestjs/mapped-types';
import { CreateTemplateItemDto } from './create-template-item.dto';

/**
 * All fields optional. PATCH semantics: only provided fields are updated.
 */
export class UpdateTemplateItemDto extends PartialType(CreateTemplateItemDto) {}
