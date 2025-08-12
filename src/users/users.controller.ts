import { Body, Controller, Get, Post, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers(){
    return this.usersService.getAllUsers();
  }

  @Post()
  postUser(@Body('nickname') nickname: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ){
    return this.usersService.createUser({
      nickname,
      email,
      password,
    });
  }

  @Post('add-result')
  addUserResult(
    @Body('email') email: string,
    @Body('result') result: any,
  ){
    return this.usersService.addUserResult(email, result);
  }

  @Get('results/:email')
  getUserResults(@Param('email') email: string){
    return this.usersService.getUserResults(email);
  }

  @Delete('results/:email/:resultId')
  deleteUserResult(
    @Param('email') email: string,
    @Param('resultId') resultId: number,
  ){
    return this.usersService.deleteUserResult(email, resultId);
  }
}
