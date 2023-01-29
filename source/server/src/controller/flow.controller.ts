import {
  Req,
  Query,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Headers,
} from '@nestjs/common';
import { FlowProvider } from 'src/provider/flow.provider';
import { Flow } from 'src/schema/flow.schema';

import { CreateFlowDto, UpdateFlowDto, FlowQuery } from 'src/types/flow.dto';

@Controller('/api/flow')
export class FlowController {
  constructor(private readonly flowProvider: FlowProvider) {}

  /**
   * 创建一笔流水
   *
   * @param bookKey 用户钥匙
   * @returns 分页数据
   */
  @Get()
  async getPage(
    @Headers('bookKey') bookKey = 'none',
    @Query('pageNum') pageNum = 1,
    @Query('pageSize') pageSize = 10,
    @Query('startDay') startDay,
    @Query('endDay') endDay,
    @Query('type') type,
    @Query('payType') payType,
    @Query('name') name,
    @Query('description') description,
    @Query('id') id,
  ) {
    if ('none' === bookKey) {
      return {
        code: 333,
        message: '查询失败，请使用合法钥匙！',
      };
    }
    const query: FlowQuery = {
      pageNum: pageNum,
      pageSize: pageSize,
      bookKey: bookKey,
      id: id,
      startDay: startDay,
      endDay: endDay,
      type: type,
      payType: payType,
      name: name,
      description: description,
    };
    const data = await this.flowProvider.getPage(query);
    return {
      code: 200,
      data,
    };
  }

  /**
   * 创建一笔流水
   *
   * @param req
   * @param createDto 流水信息传输实体
   * @param bookKey 用户钥匙
   * @returns
   */
  @Post()
  async create(
    @Headers('bookKey') bookKey = 'none',
    @Req() req: any,
    @Body() createDto: CreateFlowDto,
  ) {
    if ('none' === bookKey) {
      return {
        code: 333,
        message: '新增失败，请使用合法钥匙！',
      };
    }
    createDto.bookKey = bookKey;
    const data = await this.flowProvider.create(createDto);
    return {
      code: 200,
      data,
    };
  }

  /**
   * 更新一笔流水
   *
   * @param req
   * @param updateDto 流水信息传输实体
   * @param bookKey 用户钥匙
   * @returns
   */
  @Put('/:id')
  async update(
    @Headers('bookKey') bookKey = 'none',
    @Param('id') id: number,
    @Body() updateDto: UpdateFlowDto,
  ) {
    if ('none' === bookKey) {
      return {
        code: 333,
        message: '更新失败，请使用合法钥匙！',
      };
    }
    updateDto.bookKey = bookKey;
    const data = await this.flowProvider.update(id, updateDto);
    return {
      code: 200,
      data,
    };
  }

  /**
   * 删除一笔流水
   *
   * @param id 流水id
   * @param bookKey 用户钥匙
   * @returns
   */
  @Delete('/:id')
  async delete(@Headers('bookKey') bookKey = 'none', @Param('id') id: number) {
    if (bookKey === 'none') {
      return {
        code: 333,
        message: '删除失败，请使用合法钥匙！',
      };
    }
    const data = await this.flowProvider.delete(id, bookKey);
    return {
      code: 200,
      data,
    };
  }

  /**
   * 查询全部
   */
  @Get('/getAll')
  async getAll(
    @Headers('bookKey') bookKey = 'none',
    @Query('startDay') startDay,
    @Query('endDay') endDay,
    @Query('type') type,
    @Query('payType') payType,
    @Query('name') name,
    @Query('description') description,
  ) {
    if (bookKey === 'none') {
      return {
        code: 333,
        message: '数据获取失败，请使用合法钥匙！',
      };
    }
    const query: FlowQuery = {
      bookKey: bookKey,
      startDay: startDay,
      endDay: endDay,
      type: type,
      payType: payType,
      name: name,
      description: description,
    };
    const data = await this.flowProvider.getAll(query);
    return {
      code: 200,
      data,
    };
  }

  /**
   * 批量导入
   *
   * @returns
   */
  @Post('/importFlows')
  async importFlows(
    @Headers('bookKey') bookKey = 'none',
    @Query('flag') flag: string,
    @Body() flows: Flow[],
  ) {
    if ('none' === bookKey) {
      return {
        code: 333,
        message: '导入失败，请使用合法钥匙！',
      };
    }
    const data = await this.flowProvider.importFlows(flag, flows);
    return {
      code: 200,
      data,
    };
  }
}
