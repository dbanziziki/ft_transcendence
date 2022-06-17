import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseFilesService } from 'src/database-files/database-files.service';
import { Connection, Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		private readonly databaseFilesService: DatabaseFilesService,
		private connection: Connection
	) {}

	/** creates new user if non-existant, just returns the user otherwise */
	async createNewUser(login42: string) {
		let user = await this.findByLogin42(login42);
		if (user == undefined) {
			user = new User();
			user.login42 = login42;
			user.display_name = login42; 
			await this.usersRepository.save(user);
		}
		return user;
	}

	async turnOnTwoFactorAuthentication(userId: number) {
		return this.usersRepository.update(userId, {
			isTwoFactorAuthenticationEnabled: true,
		});
	}

	async turnOffTwoFactorAuthentication(userId: number) {
		return this.usersRepository.update(userId, {
			isTwoFactorAuthenticationEnabled: false,
		});
	}

	async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
		return this.usersRepository.update(userId, {
			twoFactorAuthenticationSecret: secret,
		});
	}

	findById(id: number) {
		return this.usersRepository.findOne(id);
	}

	findByLogin42(login42: string): Promise<User | undefined> {

		return this.usersRepository.findOne({ login42 });
	}

	findByDisplayName(display_name: string): Promise<User | undefined> {

		return this.usersRepository.findOne({ display_name });
	}

	findAll() {
		return this.usersRepository.find();
	}

	async setDisplayName(user_id: number, new_name: string) {
		const user_exists = await 
			this.usersRepository.findOne({display_name: new_name});
		if (user_exists)
			throw new ConflictException("name already taken");
		const user = await this.usersRepository.findOne(user_id);
		user.display_name = new_name;
		this.usersRepository.save(user);
		return user;
	}

	// changes file in database as transaction.
	// old avatar is deleted.
	async changeAvatar(userId: number, imageBuffer: Buffer, filename: string) {
		const queryRunner = this.connection.createQueryRunner();

		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			const user = await queryRunner.manager.findOne(User, userId);
			const currentAvatarId = user.avatarId;
			const avatar = await this.databaseFilesService.uploadDBFileWithQueryRunner(
				imageBuffer, filename, queryRunner);
			await queryRunner.manager.update(User, userId, {
				avatarId: avatar.id
			});

			if (currentAvatarId) {
				await this.databaseFilesService.deleteFileWithQueryRunner(
					currentAvatarId, queryRunner);
			}

			await queryRunner.commitTransaction();

			// return url for new database file
			return `/database-files/${avatar.id}`;
		} catch {
			await queryRunner.rollbackTransaction();
			throw new InternalServerErrorException();
		} finally {
			await queryRunner.release();
		}
	}

	async getAvatar(avatarId: number) {
		return this.databaseFilesService.getFileById(avatarId);
	}

}
