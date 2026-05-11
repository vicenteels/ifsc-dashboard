export const DEMO_TOKEN = 'demo_token_12345';

export const DEMO_USER = {
    primeiroNome: 'João',
    nomeCompleto: 'João Demo',
    userid: 9999,
};

export const DEMO_CURSOS: Record<number, string> = {
    929: 'Banco de Dados - 58972',
    930: 'Programação Front-end II - 58963',
    931: 'Inglês Instrumental - 58980',
    932: 'Estrutura de Dados - 58965',
    933: 'Segurança da Informação - 58970',
};

type DemoTarefa = {
    id: number;
    cmid: number;
    courseId: number;
    nome: string;
    prazoDate: Date;
    envioDate?: Date;
};

type DemoQuestionario = {
    id: number;
    cmid: number;
    courseId: number;
    nome: string;
    respondido: boolean;
    nota?: number;
    notaMaxima?: number;
    totalQuestoes?: number;
    timeopen?: number;
    timeclose?: number;
};

function toUnixSeconds(date: Date) {
    return Math.floor(date.getTime() / 1000);
}

function formatPtBr(date: Date) {
    return date.toLocaleString('pt-BR');
}

function endOfDay(date: Date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 0);
    return d;
}

function daysFromNow(days: number) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return endOfDay(d);
}

function daysAgo(days: number) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return endOfDay(d);
}

function buildTarefa(t: DemoTarefa) {
    const envio = t.envioDate ? new Date(t.envioDate) : null;
    return {
        id: t.id,
        cmid: t.cmid,
        link: `https://moodle.ifsc.edu.br/mod/assign/view.php?id=${t.cmid}`,
        nome: t.nome,
        disciplina: DEMO_CURSOS[t.courseId] || `Curso ${t.courseId}`,
        tipo: 'tarefa' as const,
        prazo: formatPtBr(t.prazoDate),
        prazoTimestamp: toUnixSeconds(t.prazoDate),
        status: envio ? ('enviada' as const) : ('pendente' as const),
        dataEnvio: envio ? formatPtBr(envio) : null,
        dataEnvioTimestamp: envio ? toUnixSeconds(envio) : null,
    };
}

function buildQuestionario(q: DemoQuestionario) {
    const notaMaxima = q.notaMaxima ?? 10;
    const totalQuestoes = q.totalQuestoes ?? 10;
    const timeopen =
        typeof q.timeopen === 'number' ? q.timeopen : toUnixSeconds(daysAgo(21));
    const timeclose =
        typeof q.timeclose === 'number' ? q.timeclose : toUnixSeconds(daysFromNow(21));

    return {
        id: q.id,
        cmid: q.cmid,
        link: `https://moodle.ifsc.edu.br/mod/quiz/view.php?id=${q.cmid}`,
        nome: q.nome,
        disciplina: DEMO_CURSOS[q.courseId] || `Curso ${q.courseId}`,
        courseId: q.courseId,
        tipo: 'questionario' as const,
        nota: q.respondido ? q.nota ?? null : null,
        notaMaxima,
        totalQuestoes,
        tentativas: q.respondido ? 1 : 0,
        respondido: q.respondido,
        timeopen,
        timeclose,
    };
}

export function buildDemoTarefas() {
    const tarefasPendentes: DemoTarefa[] = [
        {
            id: 1001,
            cmid: 70101,
            courseId: 930,
            nome: 'Atividade jQuery - Front-end II',
            prazoDate: daysFromNow(2),
        },
        {
            id: 1002,
            cmid: 70102,
            courseId: 929,
            nome: 'Análise ER - Banco de Dados',
            prazoDate: daysFromNow(5),
        },
        {
            id: 1003,
            cmid: 70103,
            courseId: 931,
            nome: '8th Class - Inglês (URGENTE)',
            prazoDate: daysFromNow(3),
        },
        {
            id: 1004,
            cmid: 70104,
            courseId: 932,
            nome: 'Relatório Estrutura - Estrutura de Dados',
            prazoDate: daysFromNow(7),
        },
        {
            id: 1005,
            cmid: 70105,
            courseId: 933,
            nome: 'Firewall Config - Segurança (VENCIDA)',
            prazoDate: daysAgo(2),
        },
        // Extras para teste de filtros
        {
            id: 1006,
            cmid: 70106,
            courseId: 930,
            nome: 'Componentização React - Front-end II',
            prazoDate: daysFromNow(10),
        },
        {
            id: 1007,
            cmid: 70107,
            courseId: 929,
            nome: 'Normalização (3FN) - Banco de Dados',
            prazoDate: daysFromNow(12),
        },
        {
            id: 1008,
            cmid: 70108,
            courseId: 932,
            nome: 'Árvores Binárias - Estrutura de Dados',
            prazoDate: daysFromNow(14),
        },
    ];

    const enviadasNoPrazo: DemoTarefa[] = [
        {
            id: 1101,
            cmid: 70201,
            courseId: 930,
            nome: 'Gerenciador de Inventário - Front-end II',
            prazoDate: daysAgo(1),
            envioDate: daysAgo(2),
        },
        {
            id: 1102,
            cmid: 70202,
            courseId: 929,
            nome: 'Consultas SQL - Banco de Dados',
            prazoDate: daysAgo(4),
            envioDate: daysAgo(5),
        },
        {
            id: 1103,
            cmid: 70203,
            courseId: 931,
            nome: 'Speaking Test - Inglês',
            prazoDate: daysAgo(3),
            envioDate: daysAgo(4),
        },
        {
            id: 1104,
            cmid: 70204,
            courseId: 933,
            nome: 'Modelo de Ameaças - Segurança',
            prazoDate: daysAgo(6),
            envioDate: daysAgo(7),
        },
        {
            id: 1105,
            cmid: 70205,
            courseId: 932,
            nome: 'Listas Encadeadas - Estrutura de Dados',
            prazoDate: daysAgo(8),
            envioDate: daysAgo(9),
        },
        {
            id: 1106,
            cmid: 70206,
            courseId: 931,
            nome: 'Reading Report - Inglês',
            prazoDate: daysAgo(10),
            envioDate: daysAgo(11),
        },
        {
            id: 1107,
            cmid: 70207,
            courseId: 929,
            nome: 'Índices e Performance - Banco de Dados',
            prazoDate: daysAgo(12),
            envioDate: daysAgo(13),
        },
    ];

    const enviadasForaDoPrazo: DemoTarefa[] = [
        {
            id: 1201,
            cmid: 70301,
            courseId: 930,
            nome: 'Styles CSS - Front-end II (ATRASADA)',
            prazoDate: daysAgo(7),
            envioDate: daysAgo(5),
        },
        {
            id: 1202,
            cmid: 70302,
            courseId: 932,
            nome: 'Heap vs Stack - Estrutura de Dados (ATRASADA)',
            prazoDate: daysAgo(9),
            envioDate: daysAgo(8),
        },
        {
            id: 1203,
            cmid: 70303,
            courseId: 933,
            nome: 'Políticas de Senhas - Segurança (ATRASADA)',
            prazoDate: daysAgo(11),
            envioDate: daysAgo(10),
        },
    ];

    const pendentes = tarefasPendentes.map(buildTarefa);
    const enviadas = [...enviadasNoPrazo, ...enviadasForaDoPrazo].map(buildTarefa);
    return { pendentes, enviadas };
}

export function filterDemoTarefasByDataInicio(
    tarefas: { pendentes: any[]; enviadas: any[] },
    dataInicio?: string,
) {
    if (!dataInicio) return tarefas;

    const [ano, mes, dia] = dataInicio.split('-').map(Number);
    if (!ano || !mes || !dia) return tarefas;

    const dataLocal = new Date(ano, mes - 1, dia, 23, 59, 59);
    const timestampFiltro = Math.floor(dataLocal.getTime() / 1000);

    return {
        pendentes: tarefas.pendentes.filter((t) => t.prazoTimestamp <= timestampFiltro),
        enviadas: tarefas.enviadas.filter((t) => t.prazoTimestamp <= timestampFiltro),
    };
}

export function buildDemoQuestionarios() {
    const questionarios: DemoQuestionario[] = [
        {
            id: 2001,
            cmid: 80101,
            courseId: 929,
            nome: 'Questionário 01 - Banco de Dados',
            respondido: true,
            nota: 9.5,
            notaMaxima: 10,
            totalQuestoes: 10,
        },
        {
            id: 2002,
            cmid: 80102,
            courseId: 929,
            nome: 'Modelo ER - Banco de Dados',
            respondido: true,
            nota: 8.0,
        },
        {
            id: 2003,
            cmid: 80103,
            courseId: 929,
            nome: 'Modelo Relacional - Banco de Dados',
            respondido: true,
            nota: 7.5,
        },
        {
            id: 2004,
            cmid: 80104,
            courseId: 929,
            nome: 'Prova 1 Parte 1 - Banco de Dados',
            respondido: true,
            nota: 6.0,
        },
        {
            id: 2005,
            cmid: 80105,
            courseId: 933,
            nome: 'Fundamentos Segurança - Segurança',
            respondido: true,
            nota: 9.0,
        },
        {
            id: 2006,
            cmid: 80106,
            courseId: 933,
            nome: 'SOCs - Segurança',
            respondido: true,
            nota: 8.5,
        },
        {
            id: 2007,
            cmid: 80107,
            courseId: 931,
            nome: 'Vocabulary Check - Inglês',
            respondido: true,
            nota: 7.0,
        },
        {
            id: 2008,
            cmid: 80108,
            courseId: 930,
            nome: 'Questionário Avançado - Front-end II',
            respondido: false,
        },
        {
            id: 2009,
            cmid: 80109,
            courseId: 932,
            nome: 'Teste Prático - Estrutura de Dados',
            respondido: false,
        },
        {
            id: 2010,
            cmid: 80110,
            courseId: 931,
            nome: 'Listening Test - Inglês',
            respondido: false,
        },
    ];

    return questionarios.map(buildQuestionario);
}
