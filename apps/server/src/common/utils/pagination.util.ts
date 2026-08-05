import {
  PaginationMeta,
  PaginationResult,
} from '../interfaces/pagination.interface';

interface PrismaPaginationModel<T> {
  findMany(args?: any): Promise<T[]>;
  count(args?: any): Promise<number>;
}

interface PaginateOptions {
  page: number;
  limit: number;

  where?: any;
  include?: any;
  select?: any;
  orderBy?: any;
}

export async function paginate<T>(
  model: PrismaPaginationModel<T>,
  options: PaginateOptions,
): Promise<PaginationResult<T>> {
  const {
    page,
    limit,
    where,
    include,
    select,
    orderBy,
  } = options;

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.findMany({
      where,
      include,
      select,
      orderBy,
      skip,
      take: limit,
    }),

    model.count({
      where,
    }),
  ]);

  const meta: PaginationMeta = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };

  return {
    data,
    meta,
  };
}