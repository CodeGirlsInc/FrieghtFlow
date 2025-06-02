import { Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { PaginationQueryDto } from './dtos/paginationQuery.dto';
import { ObjectLiteral, Repository } from 'typeorm';
import { PaginationInterface } from './interfaces/pagination.interface';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class PaginationProvider {
  constructor(
    @Inject(REQUEST)
    private readonly request: Request,
  ) {}

  public async paginateQuery<Generic extends ObjectLiteral>(
    paginationQueryDto: PaginationQueryDto,
    repository: Repository<Generic>,
  ): Promise<PaginationInterface<Generic>> {
    const page = paginationQueryDto.page ?? 1;
    const limit = paginationQueryDto.limit ?? 10;

    const results = await repository.find({
      skip: (page - 1) * limit,
      take: limit,
    });

    const baseUrl =
      this.request.protocol + '://' + this.request.headers.host + '/';
    const newUrl = new URL(this.request.url, baseUrl);

    const totalItems = await repository.count();
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = page;
    const nextPage = currentPage === totalPages ? currentPage : currentPage + 1;
    const previousPage = currentPage === 1 ? currentPage : currentPage - 1;

    return {
      data: results,
      metadata: {
        itemsPerPage: limit,
        currentPage: currentPage,
        totalItems: totalItems,
        totalPages: totalPages,
      },
      links: {
        firstPage: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=1`,
        lastPage: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${totalPages}`,
        currentPage: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${currentPage}`,
        nextPage: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${nextPage}`,
        previousPage: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${previousPage}`,
      },
    };
  }
}
