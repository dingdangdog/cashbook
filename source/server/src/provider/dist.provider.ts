import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Dist, DistDocument } from 'src/schema/dist.schema';
import { DefaultData } from 'src/config/default.data';

@Injectable()
export class DistProvider {
  constructor(
    @InjectModel('Dist')
    private distModel: Model<DistDocument>,
  ) {}

  async initDist() {
    // 删除原有字典
    this.distModel.deleteMany();
    // 初始化字典ID
    let id = 1;
    DefaultData.dist.forEach((value) => {
      value.id = id;
      value.sort = id;
      id++;
    });
    // 保存字典
    await this.distModel.insertMany(DefaultData.dist);
  }

  async getDistByType(type: string): Promise<Dist[]> {
    return await this.distModel.find({ type }).sort({ sort: 1 });
  }
}
