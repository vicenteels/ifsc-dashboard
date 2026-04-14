import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { MoodleService } from './moodle.service';

@Controller('moodle')
export class MoodleController {
    constructor(private readonly moodleService: MoodleService){}

    @Post('login')
    async login(@Body() body: { username:string; password: string }) {
        const token = await this.moodleService.getToken(body.username, body.password);
        return { token };
    }

    @Get('tarefas')
    async getTarefas(
        @Query('token') token: string,
        @Query('dataInicio') dataInicio?: string,) {
        return this.moodleService.getTarefas(token, dataInicio);
    }

    @Get('usuario')
    async getUsuario(@Query('token') token: string){
        return this.moodleService.getUsuario(token);
    }
}
