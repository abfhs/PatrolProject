import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { BaseModel } from "src/common/entities/base.entity";
import { RolesEnum } from "../const/roles.const";

/**
 * id: number
 * 
 * nickname: string
 * 
 * email: string
 * 
 * password: string
 * 
 * role: [RolesEnum.USER, RolesEnum.ADMIN]
 * 
 * 
 */
@Entity()
export class UsersModel extends BaseModel {

    @Column({
        // 1)
        length: 20,
        //2)
        unique: true   
    })
    // 1) 길이가 20을 넘지 않을 것
    // 2) 유일무이한 값이 될것

    nickname: string;
    
    @Column({
        unique: true,
    })
    // 1) 유일무이한 값이 될 것것
    email: string;

    @Column()
    password: string;

    @Column({
        enum: Object.values(RolesEnum),
        default: RolesEnum.USER,
    })
    role: RolesEnum;

}