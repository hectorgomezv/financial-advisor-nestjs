import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import { Index } from '../domain/entities/index.entity';
import { IndexDocument, IndexModel } from './schemas/index.schema';

@Injectable()
export class IndicesRepository {
  constructor(
    @InjectModel(IndexModel.name)
    public model: Model<IndexDocument>,
  ) {}

  async create(index: Index): Promise<Index> {
    const created = (await this.model.create(index)).toObject();
    return plainToInstance(Index, created, {
      excludePrefixes: ['_', '__'],
    });
  }

  async findAll(): Promise<Index[]> {
    const result = await this.model.find().lean();
    return plainToInstance(Index, result, { excludePrefixes: ['_', '__'] });
  }
}
