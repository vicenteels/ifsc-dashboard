import { Body, Controller, Get, Post, Query, UnauthorizedException } from '@nestjs/common';
import { MoodleService } from './moodle.service';
import {
    buildDemoQuestionarios,
    buildDemoTarefas,
    filterDemoTarefasByDataInicio,
    DEMO_CURSOS,
    DEMO_TOKEN,
    DEMO_USER,
} from '../data/demo-data';

@Controller('moodle')
export class MoodleController {
    constructor(private readonly moodleService: MoodleService) { }

    private assertDemoToken(token?: string) {
        if (!token || token !== DEMO_TOKEN) {
            throw new UnauthorizedException('Token demo invÃ¡lido.');
        }
    }

    @Post('login')
    async login(@Body() body: { username: string; password: string }) {
        const token = await this.moodleService.getToken(body.username, body.password);
        return { token };
    }

    @Post('demo-login')
    async demoLogin() {
        return {
            token: DEMO_TOKEN,
            message: 'Modo demo ativado com dados fictÃ­cios',
        };
    }

    @Get('demo/usuario')
    async demoGetUsuario(@Query('token') token?: string) {
        this.assertDemoToken(token);
        return {
            primeiroNome: DEMO_USER.primeiroNome,
            nomeCompleto: DEMO_USER.nomeCompleto,
            userid: DEMO_USER.userid,
        };
    }

    @Get('demo/tarefas')
    async demoGetTarefas(@Query('token') token?: string, @Query('dataInicio') dataInicio?: string) {
        this.assertDemoToken(token);
        return filterDemoTarefasByDataInicio(buildDemoTarefas(), dataInicio);
    }

    @Get('demo/questionarios')
    async demoGetQuestionarios(@Query('token') token?: string) {
        this.assertDemoToken(token);
        return buildDemoQuestionarios();
    }

    @Get('demo/cursos')
    async demoGetCursos(@Query('token') token?: string) {
        this.assertDemoToken(token);
        return DEMO_CURSOS;
    }

    @Get('tarefas')
    async getTarefas(
        @Query('token') token: string,
        @Query('dataInicio') dataInicio?: string,) {
        return this.moodleService.getTarefas(token, dataInicio);
    }

    @Get('usuario')
    async getUsuario(@Query('token') token: string) {
        return this.moodleService.getUsuario(token);
    }

    @Get('questionarios')
    async getQuestionarios(@Query('token') token: string, @Query('userid') userid: string) {
        const userIdNum = parseInt(userid);
        if (isNaN(userIdNum)) {
            throw new Error('userid inválido');
        }
        return this.moodleService.getQuestionarios(token, userIdNum);
    }

    @Get('cursos')
    async getCursos(@Query('token') token: string) {
        return this.moodleService.getCursos(token);
    }
}
