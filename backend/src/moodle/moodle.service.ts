import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios'; //para requisições http
import { firstValueFrom } from 'rxjs'; //para converter a resposta do Axios para um formato que o await entenda

@Injectable() //esse injectable diz que essa classe pode ser injetada em outras classes. Sem isso o Nest não saberia que essa classe existe para ser usada automaticamente
//é isso que permite eu colocar no controller constructor(private readonly moodleService: MoodleService){}
export class MoodleService {
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
                prazo: tarefa.duedate
                    ? new Date(tarefa.duedate * 1000).toLocaleString('pt-BR')
                    : 'Sem prazo',
                prazoTimestamp: tarefa.duedate,
                criadaEm: new Date(tarefa.timemodified * 1000).toLocaleString('pt-BR'),
                criadaEmTimestamp: tarefa.timemodified,
            }))
        );

        const tarefasFiltradas = dataInicio
            ? todasTarefas.filter((tarefa: any) => {
                const [ano, mes, dia] = dataInicio.split('-').map(Number);
                const dataLocal = new Date(ano, mes - 1, dia, 0, 0, 0);
                const timestampFiltro = dataLocal.getTime() / 1000;
                return tarefa.criadaEmTimestamp >= timestampFiltro;
            })
            : todasTarefas;

        //Passo 3: para cada tarefa, irá buscar o status do envio
        const tarefasComStatus = await Promise.all( //usado para executar a promise para todas as tarefas encontradas de forma simultanea
            tarefasFiltradas.map(async (tarefa: any) => {
                const status = await this.getStatusTarefa(token, tarefa.id);
                return {
                    ...tarefa, //spread ele faz o campo status ser adicionado a tarefa sem precisar reescrever os campos
                    status,
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

    async getStatusTarefa(token: string, assignid: number): Promise<string> {
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

            if (!submission || submission.status === 'new') {
                return 'pendente';
            }

            if (submission.status === 'submitted') {
                return 'enviada';
            }

            return 'pendente';
        } catch {
            return 'pendente';
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

}
