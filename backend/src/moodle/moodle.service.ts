import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios'; //para requisições http
import { firstValueFrom } from 'rxjs'; //para converter a resposta do Axios para um formato que o await entenda

@Injectable() //esse injectable diz que essa classe pode ser injetada em outras classes. Sem isso o Nest não saberia que essa classe existe para ser usada automaticamente
//é isso que permite eu colocar no controller constructor(private readonly moodleService: MoodleService){}
export class MoodleService {
    private formatHttpError(error: any) {
        const status = error?.response?.status;
        const data = error?.response?.data;
        const message = error?.message;
        return { status, message, data };
    }

    private readonly baseUrl = 'https://moodle.ifsc.edu.br';

    constructor(private readonly httpService: HttpService) { } //adiciona o httpService ao construtor da classe e já define uma variavel httpService para ser utilizada no futuro

    async getToken(username: string, password: string): Promise<string> { //uso o promise para expressar algo que sera retornado em uma função assincrona. Ele não retorna imediatamente o resultado
        const url = `${this.baseUrl}/login/token.php`; //this se refere a constante dessa classe, e não uma local caso tivesse

        const response = await firstValueFrom(
            this.httpService.get(url, { //faz uma requisição http para a url especificada
                params: { //e passa os parametros da url
                    username,
                    password,
                    service: 'moodle_mobile_app'
                },
            })
        );

        if (response.data.errorcode) { //pegar a resposta que o moodle deu e verifica se tem um erro
            throw new Error('Usuário ou ou senha incorretos') //interrompe a função e lança o erro
        }

        return response.data.token;
    }

    async getTarefas(token: string, dataInicio?: string) { //data é opcional, o ? indica isso
        //vai buscar todas as tarefas de todas as disciplinas
        const response = await firstValueFrom(
            this.httpService.get(`${this.baseUrl}/webservice/rest/server.php`, {
                params: {
                    wstoken: token,
                    wsfunction: 'mod_assign_get_assignments',
                    moodlewsrestformat: 'json',
                },
            })
        );

        const cursos = response.data.courses;

        //Passo 2: junta todas as tarefas de todos os cursos em uma unica lista
        const todasTarefas = cursos.flatMap((curso: any) => //flatMap percorre cada curtos e pega todas as tarefas e as junta em uma lista unica. Se fosse apenas o map ficaria algo como [ [tarefa1, tarefa2], [tarefa3], [tarefa4, tarefa5] ] com o flat map ele retora [ tarefa1, tarefa2, tarefa3, tarefa4, tarefa5 ]
            //o curso:any usamos quando não sabemos exatamente o tipo do objeto
            curso.assignments.map((tarefa: any) => ({
                id: tarefa.id,
                cmid: tarefa.cmid,
                link: `https://moodle.ifsc.edu.br/mod/assign/view.php?id=${tarefa.cmid}`,
                nome: tarefa.name,
                disciplina: curso.fullname.trim(),
                tipo: 'tarefa',
                prazo: tarefa.duedate
                    ? new Date(tarefa.duedate * 1000).toLocaleString('pt-BR')
                    : 'Sem prazo',
                prazoTimestamp: tarefa.duedate,
                criadaEm: new Date(tarefa.timemodified * 1000).toLocaleString('pt-BR'),
                criadaEmTimestamp: tarefa.timemodified,
                dataEnvio: null, // Será preenchido se enviada
                dataEnvioTimestamp: null,
            }))
        );

        const tarefasFiltradas = dataInicio
            ? todasTarefas.filter((tarefa: any) => {
                // Cria a data interpretando como horário local (Brasil)
                const [ano, mes, dia] = dataInicio.split('-').map(Number);
                const dataLocal = new Date(ano, mes - 1, dia, 23, 59, 59); // Fim do dia
                const timestampFiltro = dataLocal.getTime() / 1000;
                // Filtra tarefas com prazo até ou antes da data selecionada
                return tarefa.prazoTimestamp <= timestampFiltro;
            })
            : todasTarefas;

        //Passo 3: para cada tarefa, irá buscar o status do envio
        const tarefasComStatus = await Promise.all(
            tarefasFiltradas.map(async (tarefa: any) => {
                const resultado = await this.getStatusTarefa(token, tarefa.id);
                return {
                    ...tarefa,
                    status: resultado.status,
                    dataEnvioTimestamp: resultado.timemodified ? Math.floor(resultado.timemodified / 1000) : null,
                    dataEnvio: resultado.timemodified
                        ? new Date(resultado.timemodified).toLocaleString('pt-BR')
                        : null,
                };
            })
        );

        const pendentes = tarefasComStatus.filter( //o filter percorre a lista e mantém só os itens onde o stattus for o correto, assim ele forma uma nova lista apenas com as tarefas com esse status
            (t) => t.status === 'pendente'
        );
        const enviadas = tarefasComStatus.filter(
            (t) => t.status === 'enviada'
        );

        return { pendentes, enviadas };
    }

    async getStatusTarefa(token: string, assignid: number): Promise<{ status: string; timemodified: number | null }> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.baseUrl}/webservice/rest/server.php`, {
                    params: {
                        wstoken: token,
                        wsfunction: 'mod_assign_get_submission_status',
                        moodlewsrestformat: 'json',
                        assignid,
                    },
                })
            );
            const submission = response.data?.lastattempt?.submission;
            const status = !submission || submission.status === 'new' ? 'pendente' : 'enviada';
            const timemodified = submission?.timemodified ? submission.timemodified * 1000 : null;

            return { status, timemodified };
        } catch {
            return { status: 'pendente', timemodified: null };
        }
    }

    async getUsuario(token: string) {
        const response = await firstValueFrom(
            this.httpService.get(`${this.baseUrl}/webservice/rest/server.php`, {
                params: {
                    wstoken: token,
                    wsfunction: 'core_webservice_get_site_info',
                    moodlewsrestformat: 'json',
                },
            })
        );

        const nomeCompleto: string = response.data.fullname;
        const primeiroNome = nomeCompleto.split(' ')[0];

        return {
            nomeCompleto,
            primeiroNome,
            userid: response.data.userid,
        };
    }

    async getQuestionarios(token: string, userid: number) {
        const response = await firstValueFrom(
            this.httpService.get(`${this.baseUrl}/webservice/rest/server.php`, {
                params: {
                    wstoken: token,
                    wsfunction: 'mod_quiz_get_quizzes_by_courses',
                    moodlewsrestformat: 'json',
                },
            })
        );

        const quizzes = response.data.quizzes || [];
        const questionarios: any[] = [];

        console.log(`[Questionarios] userid=${userid} quizzes=${quizzes.length}`);

        for (const quiz of quizzes) {
            let respondido = false;
            let nota = null;

            try {
                // Busca as tentativas do usuário
                const attemptsResponse = await firstValueFrom(
                    this.httpService.get(`${this.baseUrl}/webservice/rest/server.php`, {
                        params: {
                            wstoken: token,
                            wsfunction: 'mod_quiz_get_user_attempts',
                            quizid: quiz.id,
                            userid: userid,
                            moodlewsrestformat: 'json',
                        },
                    })
                );

                console.log(`[Quiz ${quiz.id}] Userid: ${userid}`);
                console.log(`[Quiz ${quiz.id}] Tentativas Response:`, attemptsResponse.data);

                const attempts = attemptsResponse.data.attempts || [];
                respondido = attempts.length > 0;

                console.log(`[Quiz ${quiz.id}] Respondido:`, respondido);

                // Se respondido, busca a nota
                if (respondido) {
                    try {
                        console.log(`[Quiz ${quiz.id}] Buscando nota...`);
                        const gradeResponse = await firstValueFrom(
                            this.httpService.get(`${this.baseUrl}/webservice/rest/server.php`, {
                                params: {
                                    wstoken: token,
                                    wsfunction: 'mod_quiz_get_user_best_grade',
                                    quizid: quiz.id,
                                    userid: userid,
                                    moodlewsrestformat: 'json',
                                },
                            })
                        );

                        console.log(`[Quiz ${quiz.id}] Nota Response:`, gradeResponse.data);

                        // Verifica se tem a chave 'grade' e se é um número válido
                        if (gradeResponse.data && typeof gradeResponse.data.grade === 'number') {
                            nota = gradeResponse.data.grade;
                        } else if (gradeResponse.data && gradeResponse.data.hasgrade) {
                            nota = gradeResponse.data.grade;
                        }

                        console.log(`[Quiz ${quiz.id}] Nota final:`, nota);
                    } catch (gradeError) {
                        console.error(
                            `Erro ao buscar nota do quiz ${quiz.id}:`,
                            this.formatHttpError(gradeError)
                        );
                        // Continua sem nota se falhar
                    }
                }
            } catch (error) {
                console.error(
                    `Erro ao buscar tentativas do quiz ${quiz.id}:`,
                    this.formatHttpError(error)
                );
                respondido = false;
            }

            questionarios.push({
                id: quiz.id,
                cmid: quiz.coursemodule,
                link: `https://moodle.ifsc.edu.br/mod/quiz/view.php?id=${quiz.coursemodule}`,
                nome: quiz.name,
                disciplina: `${quiz.course}`,
                courseId: quiz.course,
                tipo: 'questionario',
                notaMaxima: quiz.grade,
                totalQuestoes: quiz.sumgrades,
                tentativas: quiz.attempts || 0,
                respondido: respondido,
                nota: nota,
                timeopen: quiz.timeopen,
                timeclose: quiz.timeclose,
            });
        }

        return questionarios;
    }

    async getCursos(token: string): Promise<Record<string, string>> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.baseUrl}/webservice/rest/server.php`, {
                    params: {
                        wstoken: token,
                        wsfunction: 'core_enrol_get_users_courses',
                        userid: '7230',
                        moodlewsrestformat: 'json',
                    },
                })
            );

            const cursos: Record<string, string> = {};
            (response.data || []).forEach((curso: any) => {
                cursos[curso.id] = curso.fullname;
            });
            return cursos;
        } catch {
            return {};
        }
    }

}
