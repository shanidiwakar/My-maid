import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ServiceService } from './service.service';
import { ServiceQueryDto } from './dto/service-query.dto';
import { ApiMessage } from 'src/common/decorators/api-message.decorator';

@ApiTags('Services')
@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @ApiMessage("Categories fetched successfully")
  @Get('categories')
  getCategories() {
    return this.serviceService.getCategories();
  }

  @Get()
  getServices(@Query() query: ServiceQueryDto) {
    return this.serviceService.getServices(query);
  }

  @Get(':id')
  getService(@Param('id') id: string) {
    return this.serviceService.getService(id);
  }
}