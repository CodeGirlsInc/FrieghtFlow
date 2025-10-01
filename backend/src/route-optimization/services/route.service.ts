import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route } from '../entities/route.entity';
import { RouteSegment } from '../entities/route-segment.entity';
import { CreateRouteDto } from '../dto/create-route.dto';
import { UpdateRouteDto } from '../dto/update-route.dto';

@Injectable()
export class RouteService {
  constructor(
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
    @InjectRepository(RouteSegment)
    private segmentRepository: Repository<RouteSegment>,
  ) {}

  async create(createRouteDto: CreateRouteDto): Promise<Route> {
    const route = this.routeRepository.create(createRouteDto);
    return await this.routeRepository.save(route);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: {
      origin?: string;
      destination?: string;
      routeType?: string;
      status?: string;
      isActive?: boolean;
    }
  ): Promise<{ routes: Route[]; total: number; page: number; limit: number }> {
    const query = this.routeRepository
      .createQueryBuilder('route')
      .leftJoinAndSelect('route.segments', 'segments')
      .orderBy('route.createdAt', 'DESC');

    // Apply filters
    if (filters?.origin) {
      query.andWhere('route.origin ILIKE :origin', { origin: `%${filters.origin}%` });
    }

    if (filters?.destination) {
      query.andWhere('route.destination ILIKE :destination', { destination: `%${filters.destination}%` });
    }

    if (filters?.routeType) {
      query.andWhere('route.routeType = :routeType', { routeType: filters.routeType });
    }

    if (filters?.status) {
      query.andWhere('route.status = :status', { status: filters.status });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('route.isActive = :isActive', { isActive: filters.isActive });
    }

    // Get total count
    const total = await query.getCount();

    // Apply pagination
    const routes = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      routes,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Route> {
    const route = await this.routeRepository.findOne({
      where: { id },
      relations: ['segments'],
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    return route;
  }

  async update(id: string, updateRouteDto: UpdateRouteDto): Promise<Route> {
    const route = await this.findOne(id);
    
    Object.assign(route, updateRouteDto);
    return await this.routeRepository.save(route);
  }

  async remove(id: string): Promise<void> {
    const route = await this.findOne(id);
    await this.routeRepository.remove(route);
  }

  async addSegment(routeId: string, segmentData: Partial<RouteSegment>): Promise<RouteSegment> {
    const route = await this.findOne(routeId);
    
    const segment = this.segmentRepository.create({
      ...segmentData,
      routeId,
    });

    return await this.segmentRepository.save(segment);
  }

  async updateSegment(segmentId: string, segmentData: Partial<RouteSegment>): Promise<RouteSegment> {
    const segment = await this.segmentRepository.findOne({
      where: { id: segmentId },
    });

    if (!segment) {
      throw new NotFoundException('Route segment not found');
    }

    Object.assign(segment, segmentData);
    return await this.segmentRepository.save(segment);
  }

  async removeSegment(segmentId: string): Promise<void> {
    const segment = await this.segmentRepository.findOne({
      where: { id: segmentId },
    });

    if (!segment) {
      throw new NotFoundException('Route segment not found');
    }

    await this.segmentRepository.remove(segment);
  }

  async getRoutesByOriginDestination(origin: string, destination: string): Promise<Route[]> {
    return await this.routeRepository.find({
      where: {
        origin,
        destination,
        isActive: true,
        status: 'active',
      },
      relations: ['segments'],
      order: { totalDistance: 'ASC' },
    });
  }

  async getRoutesByType(routeType: string): Promise<Route[]> {
    return await this.routeRepository.find({
      where: {
        routeType: routeType as any,
        isActive: true,
        status: 'active',
      },
      relations: ['segments'],
      order: { totalDistance: 'ASC' },
    });
  }

  async searchRoutes(searchTerm: string): Promise<Route[]> {
    return await this.routeRepository
      .createQueryBuilder('route')
      .leftJoinAndSelect('route.segments', 'segments')
      .where('route.name ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orWhere('route.origin ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orWhere('route.destination ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .andWhere('route.isActive = :isActive', { isActive: true })
      .orderBy('route.totalDistance', 'ASC')
      .getMany();
  }

  async getRouteStatistics(): Promise<{
    totalRoutes: number;
    activeRoutes: number;
    routesByType: Record<string, number>;
    averageDistance: number;
    averageCost: number;
    averageDuration: number;
  }> {
    const routes = await this.routeRepository.find({
      where: { isActive: true },
    });

    const totalRoutes = routes.length;
    const activeRoutes = routes.filter(r => r.status === 'active').length;
    
    const routesByType = routes.reduce((acc, route) => {
      acc[route.routeType] = (acc[route.routeType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageDistance = routes.reduce((sum, route) => sum + route.totalDistance, 0) / totalRoutes;
    const averageCost = routes.reduce((sum, route) => sum + route.baseCost, 0) / totalRoutes;
    const averageDuration = routes.reduce((sum, route) => sum + route.estimatedDuration, 0) / totalRoutes;

    return {
      totalRoutes,
      activeRoutes,
      routesByType,
      averageDistance,
      averageCost,
      averageDuration,
    };
  }
}
