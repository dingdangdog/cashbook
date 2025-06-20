import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取查询参数

  const where: any = {}; // 条件查询

  // 排除模板数据的逻辑
  if (body.excludeTemplate) {
    where.bookId = {
      not: "0"
    };
  }

  // 普通查询条件
  if (body.id) {
    // equals 等于查询
    // contains 模糊查询（pgsql和mongo中，可以增加额外参数限制忽略大小写 mode: 'insensitive'）
    where.id = {
      equals: body.id,
    };
  }
  if (body.bookId) {
    where.bookId = {
      contains: body.bookId,
    };
  }
  if (body.userId) {
    where.userId = {
      equals: Number(body.userId),
    };
  }
  if (body.source) {
    where.source = {
      contains: body.source,
    };
  }
  if (body.target) {
    where.target = {
      contains: body.target,
    };
  }

  // 分页条件
  const pageNum = Number(body.pageNum ? body.pageNum : 1);
  const pageSize = Number(body.pageSize ? body.pageSize : 15);
  const skip = (pageNum - 1) * pageSize; // 计算跳过的条目数

  // 排序条件
  const orderBy: any = [
    {
      bookId: "asc",
    },
    {
      target: "desc",
    },
  ];

  if (pageSize == -1) {
    // 查询全部，包含账本信息
    const datas = await prisma.typeRelation.findMany({ 
      where, 
      orderBy,
    });
    
    // 获取所有相关的账本信息
    const bookIds = [...new Set(datas.map(item => item.bookId))];
    const books = await prisma.book.findMany({
      where: { bookId: { in: bookIds } },
      select: { id: true, bookId: true, bookName: true }
    });
    
    // 创建账本映射
    const bookMap = new Map(books.map(book => [book.bookId, book]));
    
    // 添加账本信息到结果中
    const datasWithBookInfo = datas.map(item => {
      const bookInfo = bookMap.get(item.bookId);
      return {
        ...item,
        bookName: bookInfo?.bookName || '未知账本',
        bookDbId: bookInfo?.id || null, // 数据库内部ID
      };
    });
    
    return success({ total: datas.length, data: datasWithBookInfo, pages: 1 });
  }
  
  // 【条件、排序、分页】 组合查询
  const typeRelations = await prisma.typeRelation.findMany({
    where,
    orderBy,
    skip,
    take: pageSize,
  });
  
  // 获取相关的账本信息
  const bookIds = [...new Set(typeRelations.map(item => item.bookId))];
  const books = await prisma.book.findMany({
    where: { bookId: { in: bookIds } },
    select: { id: true, bookId: true, bookName: true }
  });
  
  // 创建账本映射
  const bookMap = new Map(books.map(book => [book.bookId, book]));
  
  // 添加账本信息到结果中
  const typeRelationsWithBookInfo = typeRelations.map(item => {
    const bookInfo = bookMap.get(item.bookId);
    return {
      ...item,
      bookName: bookInfo?.bookName || '未知账本',
      bookDbId: bookInfo?.id || null, // 数据库内部ID
    };
  });
  
  // 计算总页数
  const totalTypeRelations = await prisma.typeRelation.count({ where });
  const totalPages = Math.ceil(totalTypeRelations / pageSize);

  return success({ total: totalTypeRelations, data: typeRelationsWithBookInfo, pages: totalPages });
});
