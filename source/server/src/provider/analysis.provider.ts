import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FlowDocument } from 'src/schema/flow.schema';
import { FlowQuery } from 'src/types/flow.dto';
import {
  DailyLineChartData,
  DailyLineChartQuery,
  TotalMoneyData,
  TypePieChartData,
  TypePieChartQuery,
} from 'src/types/analysis.dto';
import type { DailyLineChartMatch } from 'src/types/analysis.dto';

@Injectable()
export class AnalysisProvider {
  constructor(
    @InjectModel('Flow')
    private flowModel: Model<FlowDocument>,
  ) {}

  async dailyLineChart(
    query: DailyLineChartQuery,
  ): Promise<DailyLineChartData[]> {
    this.flowModel.count(query);

    const match: DailyLineChartMatch = {};
    match.bookKey = { $eq: query.bookKey };
    if (query.startDay && query.endDay) {
      match.day = {
        $gte: new Date(query.startDay),
        $lte: new Date(query.endDay),
      };
    }

    const res: DailyLineChartData[] = await this.flowModel
      .aggregate()
      .match(match)
      .group({
        _id: { $dateToString: { date: '$day', format: '%Y-%m-%d' } },
        daySum: { $sum: '$money' },
      })
      .sort({ _id: 1 })
      .exec();
    return res;
  }

  async typePieChart(query: TypePieChartQuery): Promise<TypePieChartData[]> {
    this.flowModel.count(query);

    const match: DailyLineChartMatch = {};
    match.bookKey = { $eq: query.bookKey };
    if (query.startDay && query.endDay) {
      match.day = {
        $gte: new Date(query.startDay),
        $lte: new Date(query.endDay),
      };
    }

    const res: TypePieChartData[] = await this.flowModel
      .aggregate()
      .match(match)
      .group({ _id: '$type', typeSum: { $sum: '$money' } })
      .sort({ _id: 1 })
      .exec();
    return res;
  }

  async getTotalMoney(query: FlowQuery) {
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

    let money = 0;
    try {
      const data: TotalMoneyData[] = await this.flowModel
        .aggregate()
        .match(quertOption)
        .group({ _id: '$bookKey', totalMoney: { $sum: '$money' } })
        .sort({ _id: 1 })
        .exec();
      money = data[0].totalMoney;
    } catch (error) {
      console.log('总金额查询出错！');
    }
    return money;
  }
}
