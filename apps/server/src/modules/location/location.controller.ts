import { Controller, Get, Body, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LocationService } from './location.service';
import { LocationDto } from './dto/location.dto';

@ApiTags('Locations')
@Controller('locations')
export class LocationController {
  constructor(
    private readonly locationService: LocationService,
  ) {}

  @Get('cities')
  getCities() {
    return this.locationService.getCities();
  }

//   @Get('cities/:cityId/service-areas')
//   getServiceAreas(
//     @Param('cityId') cityId: string,
//   ) {
//     return this.locationService.getServiceAreas(cityId);
//   }
  @Post('cities/service-areas')
  getServiceAreas(@Body() dto: LocationDto) {
    return this.locationService.getServiceAreas(dto.cityId);
  }
}