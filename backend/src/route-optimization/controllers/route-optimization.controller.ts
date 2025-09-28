import { Controller, Post, Body, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RouteOptimizationService } from '../services/route-optimization.service';
import { OptimizeRouteDto } from '../dto/optimize-route.dto';
import { RouteOptimizationResultDto } from '../dto/route-optimization-result.dto';
import { RouteOptimizationRequest } from '../entities/route-optimization-request.entity';

@ApiTags('Route Optimization')
@Controller('route-optimization')
export class RouteOptimizationController {
  constructor(
    private readonly routeOptimizationService: RouteOptimizationService,
  ) {}

  @Post('optimize')
  @ApiOperation({ summary: 'Optimize route based on criteria' })
  @ApiResponse({
    status: 200,
    description: 'Route optimization completed successfully',
    type: RouteOptimizationResultDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid optimization criteria',
  })
  @ApiResponse({
    status: 404,
    description: 'No routes found for the specified criteria',
  })
  async optimizeRoute(
    @Body() optimizeRouteDto: OptimizeRouteDto,
    @Request() req: any,
  ): Promise<RouteOptimizationResultDto> {
    const requesterId = req.user?.id || 'anonymous';
    return await this.routeOptimizationService.optimizeRoute(optimizeRouteDto, requesterId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get optimization history for the current user' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of records to return', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Optimization history retrieved successfully',
    type: [RouteOptimizationRequest],
  })
  async getOptimizationHistory(
    @Request() req: any,
    @Query('limit') limit?: number,
  ): Promise<RouteOptimizationRequest[]> {
    const requesterId = req.user?.id || 'anonymous';
    return await this.routeOptimizationService.getOptimizationHistory(requesterId, limit);
  }

  @Get('request/:id')
  @ApiOperation({ summary: 'Get specific optimization request details' })
  @ApiParam({ name: 'id', description: 'Optimization request ID' })
  @ApiResponse({
    status: 200,
    description: 'Optimization request retrieved successfully',
    type: RouteOptimizationRequest,
  })
  @ApiResponse({
    status: 404,
    description: 'Optimization request not found',
  })
  async getOptimizationRequest(@Param('id') id: string): Promise<RouteOptimizationRequest> {
    return await this.routeOptimizationService.getOptimizationRequest(id);
  }
}
