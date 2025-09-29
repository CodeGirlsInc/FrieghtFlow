import { applyDecorators, type Type } from "@nestjs/common"
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from "@nestjs/swagger"

export const ApiPaginatedResponse = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      description: "Paginated response",
      schema: {
        allOf: [
          {
            properties: {
              data: {
                type: "array",
                items: { $ref: getSchemaPath(model) },
              },
              total: {
                type: "number",
                description: "Total number of items",
              },
              page: {
                type: "number",
                description: "Current page number",
              },
              limit: {
                type: "number",
                description: "Items per page",
              },
              totalPages: {
                type: "number",
                description: "Total number of pages",
              },
            },
          },
        ],
      },
    }),
  )
}
