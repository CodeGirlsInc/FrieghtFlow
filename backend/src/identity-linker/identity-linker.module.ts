import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { IdentityLinkerController } from "./controllers/identity-linker.controller"
import { IdentityLinkerService } from "./services/identity-linker.service"
import { CryptoService } from "./services/crypto.service"
import { IdentityLink } from "./entities/identity-link.entity"
import { WalletNonce } from "./entities/wallet-nonce.entity"

@Module({
  imports: [TypeOrmModule.forFeature([IdentityLink, WalletNonce])],
  controllers: [IdentityLinkerController],
  providers: [IdentityLinkerService, CryptoService],
  exports: [IdentityLinkerService],
})
export class IdentityLinkerModule {}
