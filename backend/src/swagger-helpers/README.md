# Swagger Helpers

Reusable decorator factories for NestJS Swagger documentation.

## Usage

```typescript
import { ApiPaginatedResponse, ApiJwtAuth, ApiFileUpload } from './swagger-helpers';

@Get()
@ApiJwtAuth()
@ApiPaginatedResponse(ShipmentDto)
findAll() { }

@Post('upload')
@ApiFileUpload('document')
uploadFile() { }
```

### `ApiPaginatedResponse(dto)`
Wraps a DTO in the standard paginated response shape `{ data: T[], total, page, limit, totalPages }`.

### `ApiJwtAuth()`
Shorthand for `@ApiBearerAuth()` + `@ApiUnauthorizedResponse()`.

### `ApiFileUpload(fieldName)`
Declares a multipart/form-data body with the given field name.
