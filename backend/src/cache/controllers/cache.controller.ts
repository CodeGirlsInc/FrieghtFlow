import { Controller, Get, Post, Delete, Param, Query, UseGuards } from "@nestjs/common"
import type { CacheService } from "../services/cache.service"
import type { SetCacheDto, DeleteCacheDto, ExpireCacheDto, ClearCacheDto } from "../dto/cache.dto"
import { RolesGuard } from "../../roles/guards/roles.guard"
import { PermissionsGuard } from "../../roles/guards/permissions.guard"
import { Roles } from "../../roles/decorators/roles.decorator"
import { RequirePermissions } from "../../roles/decorators/permissions.decorator"
import { RoleType } from "../../roles/entities/role.entity"
import { PermissionAction, PermissionResource } from "../../roles/entities/permission.entity"

@Controller("cache")
@UseGuards(RolesGuard, PermissionsGuard)
export class CacheController {
  constructor(private readonly cacheService: CacheService) {}

  @Post("set")
  @Roles(RoleType.ADMIN, RoleType.ANALYST)
  @RequirePermissions({ action: PermissionAction.CREATE, resource: PermissionResource.ALL })
  async set(setCacheDto: SetCacheDto) {
    const result = await this.cacheService.set(setCacheDto.key, setCacheDto.value, {
      ttl: setCacheDto.ttl,
      namespace: setCacheDto.namespace,
      nx: setCacheDto.nx,
    })

    return { success: result, key: setCacheDto.key }
  }

  @Get("get/:key")
  @Roles(RoleType.ADMIN, RoleType.ANALYST, RoleType.REVIEWER)
  @RequirePermissions({ action: PermissionAction.READ, resource: PermissionResource.ALL })
  async get(@Param("key") key: string, @Query("namespace") namespace?: string) {
    const value = await this.cacheService.get(key, { namespace })
    return { key, value, found: value !== null }
  }

  @Delete("delete")
  @Roles(RoleType.ADMIN, RoleType.ANALYST)
  @RequirePermissions({ action: PermissionAction.DELETE, resource: PermissionResource.ALL })
  async delete(deleteCacheDto: DeleteCacheDto) {
    const deleted = await this.cacheService.del(deleteCacheDto.keys, deleteCacheDto.namespace)
    return { deleted, keys: deleteCacheDto.keys }
  }

  @Get("exists/:key")
  @Roles(RoleType.ADMIN, RoleType.ANALYST, RoleType.REVIEWER)
  @RequirePermissions({ action: PermissionAction.READ, resource: PermissionResource.ALL })
  async exists(@Param("key") key: string, @Query("namespace") namespace?: string) {
    const exists = await this.cacheService.exists(key, namespace)
    return { key, exists }
  }

  @Get("ttl/:key")
  @Roles(RoleType.ADMIN, RoleType.ANALYST, RoleType.REVIEWER)
  @RequirePermissions({ action: PermissionAction.READ, resource: PermissionResource.ALL })
  async ttl(@Param("key") key: string, @Query("namespace") namespace?: string) {
    const ttl = await this.cacheService.ttl(key, namespace)
    return { key, ttl }
  }

  @Post("expire")
  @Roles(RoleType.ADMIN, RoleType.ANALYST)
  @RequirePermissions({ action: PermissionAction.UPDATE, resource: PermissionResource.ALL })
  async expire(expireCacheDto: ExpireCacheDto) {
    const result = await this.cacheService.expire(expireCacheDto.key, expireCacheDto.seconds, expireCacheDto.namespace)
    return { success: result, key: expireCacheDto.key, seconds: expireCacheDto.seconds }
  }

  @Get("keys")
  @Roles(RoleType.ADMIN, RoleType.ANALYST)
  @RequirePermissions({ action: PermissionAction.READ, resource: PermissionResource.ALL })
  async keys(@Query("pattern") pattern: string, @Query("namespace") namespace?: string) {
    const keys = await this.cacheService.keys(pattern || "*", namespace)
    return { pattern: pattern || "*", keys, count: keys.length }
  }

  @Delete("clear")
  @Roles(RoleType.ADMIN)
  @RequirePermissions({ action: PermissionAction.DELETE, resource: PermissionResource.ALL })
  async clear(clearCacheDto: ClearCacheDto) {
    const result = await this.cacheService.clear(clearCacheDto.namespace)
    return { success: result, namespace: clearCacheDto.namespace || "default" }
  }

  @Get("stats")
  @Roles(RoleType.ADMIN, RoleType.ANALYST)
  @RequirePermissions({ action: PermissionAction.READ, resource: PermissionResource.ALL })
  async getStats() {
    const stats = await this.cacheService.getStats()
    const provider = this.cacheService.getProviderInfo()
    return { stats, provider }
  }

  @Get("health")
  @Roles(RoleType.ADMIN, RoleType.ANALYST, RoleType.REVIEWER)
  @RequirePermissions({ action: PermissionAction.READ, resource: PermissionResource.ALL })
  async health() {
    const isHealthy = await this.cacheService.isHealthy()
    const provider = this.cacheService.getProviderInfo()
    return { healthy: isHealthy, provider, timestamp: new Date().toISOString() }
  }
}
