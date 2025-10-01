import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query,
  UseGuards,
  Request 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { RouteService } from '../services/route.service';
import { CreateRouteDto } from '../dto/create-route.dto';
import { UpdateRouteDto } from '../dto/update-route.dto';
import { Route } from '../entities/route.entity';
import { RouteSegment } from '../entities/route-segment.entity';

@ApiTags('Routes')
@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new route' })
  @ApiResponse({
    status: 201,
    description: 'Route created successfully',
    type: Route,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid route data',
  })
  async create(@Body() createRouteDto: CreateRouteDto): Promise<Route> {
    return await this.routeService.create(createRouteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all routes with optional filtering' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', type: Number })
  @ApiQuery({ name: 'origin', required: false, description: 'Filter by origin location' })
  @ApiQuery({ name: 'destination', required: false, description: 'Filter by destination location' })
  @ApiQuery({ name: 'routeType', required: false, description: 'Filter by route type' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by route status' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status', type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'Routes retrieved successfully',
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('origin') origin?: string,
    @Query('destination') destination?: string,
    @Query('routeType') routeType?: string,
    @Query('status') status?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    const filters = {
      origin,
      destination,
      routeType,
      status,
      isActive,
    };

    return await this.routeService.findAll(page, limit, filters);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search routes by name, origin, or destination' })
  @ApiQuery({ name: 'q', description: 'Search term' })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    type: [Route],
  })
  async searchRoutes(@Query('q') searchTerm: string): Promise<Route[]> {
    return await this.routeService.searchRoutes(searchTerm);
  }

  @Get('origin-destination')
  @ApiOperation({ summary: 'Get routes by origin and destination' })
  @ApiQuery({ name: 'origin', description: 'Origin location' })
  @ApiQuery({ name: 'destination', description: 'Destination location' })
  @ApiResponse({
    status: 200,
    description: 'Routes retrieved successfully',
    type: [Route],
  })
  async getRoutesByOriginDestination(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
  ): Promise<Route[]> {
    return await this.routeService.getRoutesByOriginDestination(origin, destination);
  }

  @Get('type/:routeType')
  @ApiOperation({ summary: 'Get routes by type' })
  @ApiParam({ name: 'routeType', description: 'Route type' })
  @ApiResponse({
    status: 200,
    description: 'Routes retrieved successfully',
    type: [Route],
  })
  async getRoutesByType(@Param('routeType') routeType: string): Promise<Route[]> {
    return await this.routeService.getRoutesByType(routeType);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get route statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStatistics() {
    return await this.routeService.getRouteStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get route by ID' })
  @ApiParam({ name: 'id', description: 'Route ID' })
  @ApiResponse({
    status: 200,
    description: 'Route retrieved successfully',
    type: Route,
  })
  @ApiResponse({
    status: 404,
    description: 'Route not found',
  })
  async findOne(@Param('id') id: string): Promise<Route> {
    return await this.routeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update route' })
  @ApiParam({ name: 'id', description: 'Route ID' })
  @ApiResponse({
    status: 200,
    description: 'Route updated successfully',
    type: Route,
  })
  @ApiResponse({
    status: 404,
    description: 'Route not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateRouteDto: UpdateRouteDto,
  ): Promise<Route> {
    return await this.routeService.update(id, updateRouteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete route' })
  @ApiParam({ name: 'id', description: 'Route ID' })
  @ApiResponse({
    status: 200,
    description: 'Route deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Route not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.routeService.remove(id);
  }

  @Post(':id/segments')
  @ApiOperation({ summary: 'Add segment to route' })
  @ApiParam({ name: 'id', description: 'Route ID' })
  @ApiResponse({
    status: 201,
    description: 'Segment added successfully',
    type: RouteSegment,
  })
  @ApiResponse({
    status: 404,
    description: 'Route not found',
  })
  async addSegment(
    @Param('id') routeId: string,
    @Body() segmentData: Partial<RouteSegment>,
  ): Promise<RouteSegment> {
    return await this.routeService.addSegment(routeId, segmentData);
  }

  @Patch('segments/:segmentId')
  @ApiOperation({ summary: 'Update route segment' })
  @ApiParam({ name: 'segmentId', description: 'Segment ID' })
  @ApiResponse({
    status: 200,
    description: 'Segment updated successfully',
    type: RouteSegment,
  })
  @ApiResponse({
    status: 404,
    description: 'Segment not found',
  })
  async updateSegment(
    @Param('segmentId') segmentId: string,
    @Body() segmentData: Partial<RouteSegment>,
  ): Promise<RouteSegment> {
    return await this.routeService.updateSegment(segmentId, segmentData);
  }

  @Delete('segments/:segmentId')
  @ApiOperation({ summary: 'Delete route segment' })
  @ApiParam({ name: 'segmentId', description: 'Segment ID' })
  @ApiResponse({
    status: 200,
    description: 'Segment deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Segment not found',
  })
  async removeSegment(@Param('segmentId') segmentId: string): Promise<void> {
    return await this.routeService.removeSegment(segmentId);
  }
}
