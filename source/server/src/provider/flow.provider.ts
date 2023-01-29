import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { sleep } from 'src/utils/sleep';
import { Flow, FlowDocument } from 'src/schema/flow.schema';
import { CreateFlowDto, UpdateFlowDto, FlowQuery } from 'src/types/flow.dto';
import { Page } from 'src/types/common/page.dto';
import { AnalysisProvider } from './analysis.provider';

@Injectable()
export class FlowProvider {
  idLock = false;
  constructor(
    @InjectModel('Flow')
    private flowModel: Model<FlowDocument>,
    private readonly analysisProvider: AnalysisProvider,
  ) {}

  async getPage(query: FlowQuery): Promise<Page<Flow>> {
    const and = [];

    and.push({ bookKey: { $eq: query.bookKey } });
    if (query.startDay) {
      and.push({ day: { $gte: new Date(query.startDay) } });
    }
    if (query.endDay) {
      and.push({ day: { $lte: new Date(query.endDay) } });
    }
    if (query.type) {
      and.push({ type: { $eq: query.type } });
    }
    if (query.payType) {
      and.push({ payType: { $eq: query.payType } });
    }
    if (query.id) {
      and.push({ id: { $eq: query.id } });
    }

    if (query.name) {
      and.push({ name: { $regex: query.name } });
    }
    if (query.description) {
      and.push({ description: { $regex: query.description } });
    }
    const quertOption = and.length > 0 ? { $and: and } : {};

    // console.log(JSON.stringify(quertOption));
    const data: Flow[] = await this.flowModel
      .find(quertOption)
      .sort({ day: -1 })
      .skip(query.pageSize * query.pageNum - query.pageSize)
      .limit(query.pageSize)
      .exec();

    // 单独查询符合条件的数据总数
    const total = await this.flowModel.count(quertOption).exec();
    const page = new Page<Flow>();
    page.pageData = data;
    page.pageSize = data.length;
    page.totalCount = total;
    page.totalPage = Math.ceil(
      total > query.pageSize ? total / query.pageSize : 1,
    );
    page.pageNum = parseInt(query.pageNum as any);

    const totalMoney = await this.analysisProvider.getTotalMoney(query);
    page.totalMoney = totalMoney;
    return page;
  }

  async create(createFlowDto: CreateFlowDto): Promise<Flow> {
    const createdData = new this.flowModel({
      bookKey: createFlowDto.bookKey,
      day: new Date(createFlowDto.day),
      name: createFlowDto.name,
      type: createFlowDto.type,
      money: createFlowDto.money,
      payType: createFlowDto.payType,
      description: createFlowDto.description,
    });
    const newId = await this.getNewId();
    createdData.id = newId;
    const res = createdData.save();
    return res;
  }

  async update(id: number, updateFlowDto: UpdateFlowDto) {
    const res = this.flowModel.updateOne(
      { id },
      {
        bookKey: updateFlowDto.bookKey,
        day: new Date(updateFlowDto.day),
        name: updateFlowDto.name,
        type: updateFlowDto.type,
        money: updateFlowDto.money,
        payType: updateFlowDto.payType,
        description: updateFlowDto.description,
      },
    );
    return res;
  }

  async delete(id: number, bookKey: string) {
    const deleteO: Flow = await this.getOneByIdAndBook(id, bookKey);
    const data = this.flowModel.deleteOne({ id: deleteO.id });
    return data;
  }

  async deleteAll(bookKey: string) {
    const data = this.flowModel.deleteMany({ bookKey });
    return data;
  }

  async getAll(query: FlowQuery): Promise<Flow[]> {
    const and = [];

    and.push({ bookKey: { $eq: query.bookKey } });
    if (query.startDay) {
      and.push({ day: { $gte: new Date(query.startDay) } });
    }
    if (query.endDay) {
      and.push({ day: { $lte: new Date(query.endDay) } });
    }
    if (query.type) {
      and.push({ type: { $eq: query.type } });
    }
    if (query.payType) {
      and.push({ payType: { $eq: query.payType } });
    }
    if (query.id) {
      and.push({ id: { $eq: query.id } });
    }

    if (query.name) {
      and.push({ name: { $regex: query.name } });
    }
    if (query.description) {
      and.push({ description: { $regex: query.description } });
    }
    const quertOption = and.length > 0 ? { $and: and } : {};

    return await this.flowModel.find(quertOption).sort({ day: -1 }).exec();
  }

  async getOneByIdAndBook(id: number, bookKey: string): Promise<Flow> {
    return await this.flowModel
      .findOne({ id: id, bookKey: bookKey })
      .sort({ day: -1 })
      .exec();
  }

  async getNewId() {
    while (this.idLock) {
      await sleep(10);
    }
    this.idLock = true;
    const maxObj = await this.flowModel
      .find({})
      .sort({ id: -1 })
      .limit(1)
      .exec();
    let res = 1;
    if (maxObj.length) {
      res = maxObj[0].id + 1;
    }
    this.idLock = false;
    return res;
  }

  async importFlows(flag: string, flows: Flow[]) {
    if (flag === 'overwrite') {
      const deleteData = await this.flowModel.deleteMany().exec();
      console.log(deleteData);
    } else {
      let nextId: number = await this.getNewId();
      this.idLock = true;
      flows.forEach(async (flow) => {
        flow.id = nextId;
        nextId++;
      });
      this.idLock = false;
    }
    const res = await this.flowModel.insertMany(flows);
    return res;
  }
}
