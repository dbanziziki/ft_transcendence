import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DatabaseFilesModule } from './database-files/database-files.module';
import { HtmlModule } from './html/html.module';
import { ConfigModule } from '@nestjs/config';
import { typeormConfig } from 'src/config/typeorm.config';
import { ChatModule } from './chat/chat.module';
import { MockAuthModule } from './mock_auth/mock_auth.module';
import { ChatGateway } from './chat/chat.gateway';

@Module({
	imports: [
		AuthModule, 
		UsersModule, 
		DatabaseFilesModule, 
		HtmlModule,
		ConfigModule.forRoot({isGlobal: true}),
		TypeOrmModule.forRootAsync(typeormConfig),
		ChatModule,
		MockAuthModule, 
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
