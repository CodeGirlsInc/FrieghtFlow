import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { CreateBlockchainDto } from './dto/create-blockchain.dto';
import { UpdateBlockchainDto } from './dto/update-blockchain.dto';

@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Post()
  create(@Body() createBlockchainDto: CreateBlockchainDto) {
    return this.blockchainService.create(createBlockchainDto);
  }

  @Get()
  findAll() {
    return this.blockchainService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blockchainService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlockchainDto: UpdateBlockchainDto) {
    return this.blockchainService.update(+id, updateBlockchainDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blockchainService.remove(+id);
  }
}
