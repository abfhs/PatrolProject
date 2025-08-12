import {PipeTransform, Injectable, ArgumentMetadata, BadRequestException, Inject} from '@nestjs/common'

@Injectable()
export class PasswordPipe implements PipeTransform{
    transform(value: any, metadata: ArgumentMetadata) {
        const password = value.toString();
        if(password.length < 6){
            throw new BadRequestException('비밀번호는 6자 이상 입력해주세요!');
        }
        if(password.length > 12){
            throw new BadRequestException('비밀번호는 12자 이하로 입력해주세요!');
        }
        return password;
    }
}

@Injectable()
export class MaxLengthPipe implements PipeTransform{
    
    constructor(private readonly length: number,
        private readonly subject: string
    ){

    }

    transform(value: any, metadata: ArgumentMetadata) {
        if(value.toString().length > this.length){
            throw new BadRequestException(`${this.subject}의 최대 길이는 ${this.length}입니다.`);
        }
        return value.toString();
    }
}

@Injectable()
export class MinLengthPipe implements PipeTransform{
    constructor(private readonly length: number){}

    transform(value: any, metadata: ArgumentMetadata) {
        if(value.toString().length < this.length){
            throw new BadRequestException(`최소 길이는 ${this.length}입니다.`);
        }

        return value.toString();
    }
}

@Injectable()
export class FlexiblePasswordPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        const password = value.toString();
        
        // 길이 제한 검사
        if (password.length < 6 || password.length > 12) {
            throw new BadRequestException('비밀번호는 6자 이상 12자 이하로 입력해주세요.');
        }
        
        // 5가지 조건 검사
        const conditions = [
            password.length >= 6, // 6자 이상
            /(?=.*[a-z])/.test(password), // 소문자 포함
            /(?=.*[A-Z])/.test(password), // 대문자 포함
            /(?=.*\d)/.test(password), // 숫자 포함
            /(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password), // 특수문자 포함
        ];
        
        const satisfiedCount = conditions.filter(Boolean).length;
        
        if (satisfiedCount < 3) {
            throw new BadRequestException('비밀번호는 다음 조건 중 최소 3가지 이상을 만족해야 합니다: 6자 이상, 소문자 포함, 대문자 포함, 숫자 포함, 특수문자 포함');
        }
        
        return password;
    }
}

