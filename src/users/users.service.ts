import { BadGatewayException, Injectable } from '@nestjs/common';
import { UsersModel } from './entities/users.entitys';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UsersModel)
        private readonly userRepository: Repository<UsersModel>,
    ){}

    async createUser(user: Pick<UsersModel, 'email'|'nickname'|'password'>){
        // 1) nickname 중복이 없는지 확인
        // exist() -> 만약에 조건에 해당되는 값이 있으면 true반환
        const nicknameExist = await this.userRepository.exists({
            where:{
                nickname: user.nickname,
            }
        })

        if(nicknameExist){
           throw new BadGatewayException('이미 존재하는 nickname 입니다!') 
        }

        const emailExists = await this.userRepository.exists({
            where: {
                email: user.email,
            }
        });

        if(emailExists){
            throw new BadGatewayException('이미 가입한 email 입니다!')
        }
        
        const userObject = this.userRepository.create({
            nickname: user.nickname,
            email: user.email,
            password: user.password,
        });

        const newUser = await this.userRepository.save(userObject);

        return newUser;
    }

    async getAllUsers(){
        return this.userRepository.find();
    }

    async getUserByEmail(email: string){
        return this.userRepository.findOne({
            where:{
                email,
            },
        })
    }
}
