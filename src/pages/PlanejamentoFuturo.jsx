import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    TextField,
    Typography
} from "@mui/material";
import {
    buscarFaturas,
    buscarPlanejamento,
    salvarPlanejamento
} from "../services/localStorageService";

const meses = [
    "Janeiro",
    "Fevereiro",
    "Marco",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
];

function normalizarTexto(texto) {
    return String(texto)
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function PlanejamentoFuturo() {
    const navigate = useNavigate();

    const [planejamento, setPlanejamento] = useState(() => buscarPlanejamento());
    const [saldoAtual, setSaldoAtual] = useState(
        () => String(buscarPlanejamento().saldoAtual || "")
    );
    const [descricaoRecebimento, setDescricaoRecebimento] = useState("");
    const [valorRecebimento, setValorRecebimento] = useState("");
    const [mesRecebimento, setMesRecebimento] = useState("");
    const [anoRecebimento, setAnoRecebimento] = useState(new Date().getFullYear());
    const [descricaoDespesa, setDescricaoDespesa] = useState("");
    const [valorDespesa, setValorDespesa] = useState("");
    const [mesDespesa, setMesDespesa] = useState("");
    const [anoDespesa, setAnoDespesa] = useState(new Date().getFullYear());

    function atualizarPlanejamento(novoPlanejamento) {
        setPlanejamento(novoPlanejamento);
        salvarPlanejamento(novoPlanejamento);
    }

    function salvarSaldo(event) {
        event.preventDefault();

        atualizarPlanejamento({
            ...planejamento,
            saldoAtual: Number(saldoAtual || 0)
        });
    }

    function salvarRecebimento(event) {
        event.preventDefault();

        if (!descricaoRecebimento || !valorRecebimento || !mesRecebimento || !anoRecebimento) {
            alert("Preencha descricao, valor, mes e ano.");
            return;
        }

        const novoRecebimento = {
            id: Date.now(),
            descricao: descricaoRecebimento.trim(),
            valor: Number(valorRecebimento),
            mes: mesRecebimento.trim(),
            ano: Number(anoRecebimento)
        };

        atualizarPlanejamento({
            ...planejamento,
            recebimentos: [...planejamento.recebimentos, novoRecebimento]
        });

        setDescricaoRecebimento("");
        setValorRecebimento("");
        setMesRecebimento("");
        setAnoRecebimento(new Date().getFullYear());
    }

    function salvarDespesa(event) {
        event.preventDefault();

        if (!descricaoDespesa || !valorDespesa || !mesDespesa || !anoDespesa) {
            alert("Preencha descricao, valor, mes e ano.");
            return;
        }

        const novaDespesa = {
            id: Date.now(),
            descricao: descricaoDespesa.trim(),
            valor: Number(valorDespesa),
            mes: mesDespesa.trim(),
            ano: Number(anoDespesa)
        };

        atualizarPlanejamento({
            ...planejamento,
            despesas: [...planejamento.despesas, novaDespesa]
        });

        setDescricaoDespesa("");
        setValorDespesa("");
        setMesDespesa("");
        setAnoDespesa(new Date().getFullYear());
    }

    function excluirRecebimento(recebimentoId) {
        atualizarPlanejamento({
            ...planejamento,
            recebimentos: planejamento.recebimentos.filter(
                recebimento => recebimento.id !== recebimentoId
            )
        });
    }

    function excluirDespesa(despesaId) {
        atualizarPlanejamento({
            ...planejamento,
            despesas: planejamento.despesas.filter(
                despesa => despesa.id !== despesaId
            )
        });
    }

    function chaveMesAno(item) {
        return `${item.ano}-${normalizarTexto(item.mes)}`;
    }

    function ordenarMeses(a, b) {
        const indiceMesA = meses.findIndex(
            mes => normalizarTexto(mes) === normalizarTexto(a.mes)
        );
        const indiceMesB = meses.findIndex(
            mes => normalizarTexto(mes) === normalizarTexto(b.mes)
        );

        if (a.ano !== b.ano) {
            return a.ano - b.ano;
        }

        return (indiceMesA === -1 ? 99 : indiceMesA) - (indiceMesB === -1 ? 99 : indiceMesB);
    }

    const faturas = buscarFaturas();

    const mesesPlanejados = [
        ...faturas.map(fatura => ({
            mes: fatura.mes,
            ano: fatura.ano
        })),
        ...planejamento.recebimentos.map(recebimento => ({
            mes: recebimento.mes,
            ano: recebimento.ano
        })),
        ...planejamento.despesas.map(despesa => ({
            mes: despesa.mes,
            ano: despesa.ano
        }))
    ];

    const mesesUnicos = Array.from(
        new Map(mesesPlanejados.map(item => [chaveMesAno(item), item])).values()
    ).sort(ordenarMeses);

    const projecao = mesesUnicos.reduce((resultado, item) => {
        const saldoInicial = resultado.saldoAtual;
        const recebimentosDoMes = planejamento.recebimentos.filter(
            recebimento => chaveMesAno(recebimento) === chaveMesAno(item)
        );
        const despesasDoMes = planejamento.despesas.filter(
            despesa => chaveMesAno(despesa) === chaveMesAno(item)
        );
        const faturasDoMes = faturas.filter(
            fatura => chaveMesAno(fatura) === chaveMesAno(item)
        );

        const totalRecebimentos = recebimentosDoMes.reduce(
            (total, recebimento) => total + recebimento.valor,
            0
        );
        const totalDespesas = despesasDoMes.reduce(
            (total, despesa) => total + despesa.valor,
            0
        );
        const totalFaturas = faturasDoMes.reduce(
            (total, fatura) => total + fatura.valorTotal,
            0
        );
        const saldoFinal = saldoInicial + totalRecebimentos - totalDespesas - totalFaturas;

        return {
            saldoAtual: saldoFinal,
            itens: [
                ...resultado.itens,
                {
                    ...item,
                    saldoInicial,
                    recebimentosDoMes,
                    despesasDoMes,
                    faturasDoMes,
                    totalRecebimentos,
                    totalDespesas,
                    totalFaturas,
                    saldoFinal
                }
            ]
        };
    }, {
        saldoAtual: Number(planejamento.saldoAtual || 0),
        itens: []
    }).itens;

    return (
        <Container maxWidth="sm" sx={{ py: 3 }}>
            <Button variant="outlined" onClick={() => navigate("/")}>
                Voltar
            </Button>

            <Typography variant="h4" fontWeight="bold" sx={{ mt: 2 }} gutterBottom>
                Planejamento Futuro
            </Typography>

            <Card sx={{ mb: 3, borderRadius: 3 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Saldo Atual
                    </Typography>

                    <Box component="form" onSubmit={salvarSaldo}>
                        <TextField
                            label="Quanto tenho hoje"
                            type="number"
                            value={saldoAtual}
                            onChange={event => setSaldoAtual(event.target.value)}
                            placeholder="Ex: 800"
                            fullWidth
                            margin="normal"
                        />

                        <Button type="submit" variant="contained" sx={{ mt: 1 }}>
                            Salvar Saldo
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            <Card sx={{ mb: 3, borderRadius: 3 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Recebimentos Futuros
                    </Typography>

                    <Box component="form" onSubmit={salvarRecebimento}>
                        <TextField
                            label="Descricao"
                            value={descricaoRecebimento}
                            onChange={event => setDescricaoRecebimento(event.target.value)}
                            placeholder="Ex: Salario"
                            fullWidth
                            margin="normal"
                        />

                        <TextField
                            label="Valor"
                            type="number"
                            value={valorRecebimento}
                            onChange={event => setValorRecebimento(event.target.value)}
                            placeholder="Ex: 2000"
                            fullWidth
                            margin="normal"
                        />

                        <TextField
                            label="Mes"
                            value={mesRecebimento}
                            onChange={event => setMesRecebimento(event.target.value)}
                            placeholder="Ex: Julho"
                            fullWidth
                            margin="normal"
                        />

                        <TextField
                            label="Ano"
                            type="number"
                            value={anoRecebimento}
                            onChange={event => setAnoRecebimento(event.target.value)}
                            fullWidth
                            margin="normal"
                        />

                        <Button type="submit" variant="contained" sx={{ mt: 1 }}>
                            Adicionar Recebimento
                        </Button>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                        {planejamento.recebimentos.map(recebimento => (
                            <Box
                                key={recebimento.id}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 1,
                                    py: 1,
                                    borderTop: "1px solid",
                                    borderColor: "divider"
                                }}
                            >
                                <Box>
                                    <Typography fontWeight="bold">
                                        {recebimento.descricao}
                                    </Typography>
                                    <Typography>
                                        {recebimento.mes}/{recebimento.ano} - R$ {recebimento.valor.toFixed(2)}
                                    </Typography>
                                </Box>

                                <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() => excluirRecebimento(recebimento.id)}
                                >
                                    Excluir
                                </Button>
                            </Box>
                        ))}
                    </Box>
                </CardContent>
            </Card>

            <Card sx={{ mb: 3, borderRadius: 3 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Despesas Futuras
                    </Typography>

                    <Box component="form" onSubmit={salvarDespesa}>
                        <TextField
                            label="Descricao"
                            value={descricaoDespesa}
                            onChange={event => setDescricaoDespesa(event.target.value)}
                            placeholder="Ex: Aluguel"
                            fullWidth
                            margin="normal"
                        />

                        <TextField
                            label="Valor"
                            type="number"
                            value={valorDespesa}
                            onChange={event => setValorDespesa(event.target.value)}
                            placeholder="Ex: 700"
                            fullWidth
                            margin="normal"
                        />

                        <TextField
                            label="Mes"
                            value={mesDespesa}
                            onChange={event => setMesDespesa(event.target.value)}
                            placeholder="Ex: Julho"
                            fullWidth
                            margin="normal"
                        />

                        <TextField
                            label="Ano"
                            type="number"
                            value={anoDespesa}
                            onChange={event => setAnoDespesa(event.target.value)}
                            fullWidth
                            margin="normal"
                        />

                        <Button type="submit" variant="contained" sx={{ mt: 1 }}>
                            Adicionar Despesa
                        </Button>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                        {planejamento.despesas.map(despesa => (
                            <Box
                                key={despesa.id}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 1,
                                    py: 1,
                                    borderTop: "1px solid",
                                    borderColor: "divider"
                                }}
                            >
                                <Box>
                                    <Typography fontWeight="bold">
                                        {despesa.descricao}
                                    </Typography>
                                    <Typography>
                                        {despesa.mes}/{despesa.ano} - R$ {despesa.valor.toFixed(2)}
                                    </Typography>
                                </Box>

                                <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() => excluirDespesa(despesa.id)}
                                >
                                    Excluir
                                </Button>
                            </Box>
                        ))}
                    </Box>
                </CardContent>
            </Card>

            <Typography variant="h6" fontWeight="bold" gutterBottom>
                Projecao Mensal
            </Typography>

            {projecao.length === 0 ? (
                <Typography>Nenhum mes para projetar.</Typography>
            ) : (
                projecao.map(item => (
                    <Card key={chaveMesAno(item)} sx={{ mb: 2, borderRadius: 3 }}>
                        <CardContent>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 1
                                }}
                            >
                                <Typography variant="h6" fontWeight="bold">
                                    {item.mes}/{item.ano}
                                </Typography>

                                <Chip
                                    label={item.saldoFinal < 0 ? "Vai faltar" : "Ok"}
                                    color={item.saldoFinal < 0 ? "error" : "success"}
                                    size="small"
                                />
                            </Box>

                            <Typography sx={{ mt: 1 }}>
                                Saldo inicial: R$ {item.saldoInicial.toFixed(2)}
                            </Typography>
                            <Typography>
                                Vou receber: R$ {item.totalRecebimentos.toFixed(2)}
                            </Typography>
                            <Typography>
                                Faturas: R$ {item.totalFaturas.toFixed(2)}
                            </Typography>
                            <Typography>
                                Outras despesas: R$ {item.totalDespesas.toFixed(2)}
                            </Typography>
                            <Typography fontWeight="bold" color={item.saldoFinal < 0 ? "error.main" : "success.main"}>
                                Saldo previsto: R$ {item.saldoFinal.toFixed(2)}
                            </Typography>
                        </CardContent>
                    </Card>
                ))
            )}
        </Container>
    );
}

export default PlanejamentoFuturo;
