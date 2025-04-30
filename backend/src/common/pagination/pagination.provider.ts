import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PaginationQueryDto } from './dtos/paginationQuery.dto';
import { ObjectLiteral, Repository } from 'typeorm';
import { PaginationInterface } from './interfaces/pagination.interface';

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
    // RESULTS BASED ON THE LIMIT & PAGE NUMBERS
    const results = await repository.find({
      skip: (paginationQueryDto.page - 1) * paginationQueryDto.limit,
      take: paginationQueryDto.limit,
    });

    // CREATE THE REQUEST URL

    // Base Url
    const baseUrl =
      this.request.protocol + '://' + this.request.headers.host + '/';

    // Full Url
    const newUrl = new URL(this.request.url, baseUrl);

    // CALCULATE THE METADATA DETAILS
    const itemsPerPage = paginationQueryDto.limit;

    const totalItems = await repository.count();

    const currentPage = paginationQueryDto.page;

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const nextPage = currentPage === totalPages ? currentPage : currentPage + 1;

    const previousPage = currentPage === 1 ? currentPage : currentPage - 1;

    const finalResults: PaginationInterface<Generic> = {
      data: results,
      metadata: {
        itemsPerPage: itemsPerPage,
        currentPage: currentPage,
        totalItems: totalItems,
        totalPages: totalPages,
      },
      links: {
        firstPage: `${newUrl.origin}${newUrl.pathname}?limit=${paginationQueryDto.limit}&page=1`,
        lastPage: `${newUrl.origin}${newUrl.pathname}?limit=${paginationQueryDto.limit}&page=${totalPages}`,
        currentPage: `${newUrl.origin}${newUrl.pathname}?limit=${paginationQueryDto.limit}&page=${currentPage}`,
        nextPage: `${newUrl.origin}${newUrl.pathname}?limit=${paginationQueryDto.limit}&page=${nextPage}`,
        previousPage: `${newUrl.origin}${newUrl.pathname}?limit=${paginationQueryDto.limit}&page=${previousPage}`,
      },
    };

    return finalResults;
  }
}
