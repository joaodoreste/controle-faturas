import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import ResumoPorPessoa from "../components/ResumoPorPessoa";
import {
    buscarFaturas,
    buscarGastos,
    buscarPagamentosMinhaParte,
    salvarGastos,
    salvarPagamentosMinhaParte
} from "../services/localStorageService";

function DetalheFatura() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [gastos, setGastos] = useState(() =>
        buscarGastos().filter(gasto => String(gasto.faturaId) === String(id))
    );
    const [pagamentosMinhaParte, setPagamentosMinhaParte] = useState(() =>
        buscarPagamentosMinhaParte().filter(
            pagamento => String(pagamento.faturaId) === String(id)
        )
    );
    const [descricao, setDescricao] = useState("");
    const [valor, setValor] = useState("");
    const [devedor, setDevedor] = useState("");
    const [gastoEditandoId, setGastoEditandoId] = useState(null);
    const [valorPagamento, setValorPagamento] = useState("");
    const [dataPagamento, setDataPagamento] = useState(
        new Date().toISOString().slice(0, 10)
    );

    const faturas = buscarFaturas();
    const fatura = faturas.find(item => String(item.id) === String(id));

    function limparFormulario() {
        setDescricao("");
        setValor("");
        setDevedor("");
        setGastoEditandoId(null);
    }

    function limparPagamento() {
        setValorPagamento("");
        setDataPagamento(new Date().toISOString().slice(0, 10));
    }

    function salvarGasto(event) {
        event.preventDefault();

        if (!descricao || !valor) {
            alert("Preencha a descricao e o valor.");
            return;
        }

        if (!devedor) {
            alert("Informe quem deve esse valor.");
            return;
        }

        const dadosGasto = {
            descricao: descricao.trim(),
            valor: Number(valor),
            devedor: devedor.trim()
        };

        const todosGastos = buscarGastos();

        if (gastoEditandoId) {
            const gastosAtualizados = todosGastos.map(gasto =>
                gasto.id === gastoEditandoId
                    ? {
                        ...gasto,
                        ...dadosGasto,
                        pago: gasto.pago
                    }
                    : gasto
            );

            salvarGastos(gastosAtualizados);
            setGastos(gastosAtualizados.filter(
                gasto => String(gasto.faturaId) === String(id)
            ));
            limparFormulario();
            return;
        }

        const novoGasto = {
            id: Date.now(),
            faturaId: Number(id),
            ...dadosGasto,
            pago: false
        };

        salvarGastos([...todosGastos, novoGasto]);
        setGastos([...gastos, novoGasto]);
        limparFormulario();
    }

    function editarGasto(gasto) {
        setGastoEditandoId(gasto.id);
        setDescricao(gasto.descricao);
        setValor(String(gasto.valor));
        setDevedor(gasto.devedor);
    }

    function alternarPago(gastoId) {
        const todosGastos = buscarGastos();

        const gastosAtualizados = todosGastos.map(gasto =>
            gasto.id === gastoId
                ? { ...gasto, pago: !gasto.pago }
                : gasto
        );

        salvarGastos(gastosAtualizados);
        setGastos(gastosAtualizados.filter(
            gasto => String(gasto.faturaId) === String(id)
        ));
    }

    function excluirGasto(gastoId) {
        const confirmar = confirm("Tem certeza que deseja excluir esse gasto?");
        if (!confirmar) return;

        const gastosAtualizados = buscarGastos().filter(
            gasto => gasto.id !== gastoId
        );

        salvarGastos(gastosAtualizados);
        setGastos(gastos.filter(gasto => gasto.id !== gastoId));

        if (gastoEditandoId === gastoId) {
            limparFormulario();
        }
    }

    function salvarPagamentoMinhaParte(event) {
        event.preventDefault();

        if (!valorPagamento || !dataPagamento) {
            alert("Informe o valor e a data do pagamento.");
            return;
        }

        const valorConvertido = Number(valorPagamento);

        if (valorConvertido <= 0) {
            alert("Informe um valor maior que zero.");
            return;
        }

        if (valorConvertido > faltaEuPagar) {
            alert("O valor pago nao pode ser maior que o valor que falta pagar.");
            return;
        }

        const novoPagamento = {
            id: Date.now(),
            faturaId: Number(id),
            valor: valorConvertido,
            data: dataPagamento
        };

        salvarPagamentosMinhaParte([
            ...buscarPagamentosMinhaParte(),
            novoPagamento
        ]);
        setPagamentosMinhaParte([...pagamentosMinhaParte, novoPagamento]);
        limparPagamento();
    }

    function excluirPagamentoMinhaParte(pagamentoId) {
        const confirmar = confirm("Tem certeza que deseja excluir esse pagamento?");
        if (!confirmar) return;

        const pagamentosAtualizados = buscarPagamentosMinhaParte().filter(
            pagamento => pagamento.id !== pagamentoId
        );

        salvarPagamentosMinhaParte(pagamentosAtualizados);
        setPagamentosMinhaParte(
            pagamentosMinhaParte.filter(pagamento => pagamento.id !== pagamentoId)
        );
    }

    function formatarData(data) {
        if (!data) return "";

        const [ano, mes, dia] = data.split("-");
        return `${dia}/${mes}/${ano}`;
    }

    if (!fatura) {
        return (
            <Container maxWidth="sm" sx={{ py: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                    Fatura nao encontrada
                </Typography>

                <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate("/")}>
                    Voltar
                </Button>
            </Container>
        );
    }

    const totalQueDevem = gastos
        .reduce((total, gasto) => total + gasto.valor, 0);

    const totalPago = gastos
        .filter(gasto => gasto.pago)
        .reduce((total, gasto) => total + gasto.valor, 0);

    const totalPendente = totalQueDevem - totalPago;
    const minhaParte = fatura.valorTotal - totalQueDevem;

    const totalPagoPorMim = pagamentosMinhaParte.reduce(
        (total, pagamento) => total + Number(pagamento.valor || 0),
        0
    );

    const faltaEuPagar = Math.max(minhaParte - totalPagoPorMim, 0);

    const pagamentosOrdenados = [...pagamentosMinhaParte].sort(
        (a, b) => String(b.data).localeCompare(String(a.data))
    );

    return (
        <Container maxWidth="sm" sx={{ py: 3 }}>
            <Button variant="outlined" onClick={() => navigate("/")}>
                Voltar
            </Button>

            <Typography variant="h4" fontWeight="bold" sx={{ mt: 2 }}>
                {fatura.mes}/{fatura.ano}
            </Typography>

            <Typography variant="body1" color="text.secondary" gutterBottom>
                Valor total: R$ {fatura.valorTotal.toFixed(2)}
            </Typography>

            <Card sx={{ mt: 2, mb: 3, borderRadius: 3 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Resumo da Fatura
                    </Typography>

                    <Typography>Pessoas me devem: R$ {totalQueDevem.toFixed(2)}</Typography>
                    <Typography>Ja recebi: R$ {totalPago.toFixed(2)}</Typography>
                    <Typography>Falta receber: R$ {totalPendente.toFixed(2)}</Typography>

                    <Typography fontWeight="bold" sx={{ mt: 1 }}>
                        Minha parte: R$ {minhaParte.toFixed(2)}
                    </Typography>

                    <Typography>Ja paguei: R$ {totalPagoPorMim.toFixed(2)}</Typography>

                    <Typography fontWeight="bold" color="warning.main">
                        Falta eu pagar: R$ {faltaEuPagar.toFixed(2)}
                    </Typography>

                </CardContent>
            </Card>

            <Card sx={{ mb: 3, borderRadius: 3 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Pagamentos da Minha Parte
                    </Typography>

                    <Typography>Total da fatura: R$ {fatura.valorTotal.toFixed(2)}</Typography>
                    <Typography>Pessoas me devem: R$ {totalQueDevem.toFixed(2)}</Typography>

                    <Typography fontWeight="bold">
                        Sobrou para mim: R$ {minhaParte.toFixed(2)}
                    </Typography>

                    <Typography>Ja paguei: R$ {totalPagoPorMim.toFixed(2)}</Typography>

                    <Typography fontWeight="bold" color="warning.main">
                        Falta eu pagar: R$ {faltaEuPagar.toFixed(2)}
                    </Typography>

                    <Box component="form" onSubmit={salvarPagamentoMinhaParte} sx={{ mt: 2 }}>
                        <TextField
                            label="Data do pagamento"
                            type="date"
                            value={dataPagamento}
                            onChange={event => setDataPagamento(event.target.value)}
                            fullWidth
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                            label="Valor pago"
                            type="number"
                            value={valorPagamento}
                            onChange={event => setValorPagamento(event.target.value)}
                            placeholder="Ex: 100"
                            fullWidth
                            margin="normal"
                        />

                        <Button type="submit" variant="contained" sx={{ mt: 1 }}>
                            Marcar como pago
                        </Button>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                        {pagamentosOrdenados.length === 0 ? (
                            <Typography color="text.secondary">
                                Nenhum pagamento registrado.
                            </Typography>
                        ) : (
                            pagamentosOrdenados.map(pagamento => (
                                <Box
                                    key={pagamento.id}
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
                                            R$ {Number(pagamento.valor).toFixed(2)}
                                        </Typography>

                                        <Typography color="text.secondary">
                                            {formatarData(pagamento.data)}
                                        </Typography>
                                    </Box>

                                    <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        onClick={() => excluirPagamentoMinhaParte(pagamento.id)}
                                    >
                                        Excluir
                                    </Button>
                                </Box>
                            ))
                        )}
                    </Box>
                </CardContent>
            </Card>

            <ResumoPorPessoa gastos={gastos} />

            <Card sx={{ mt: 3, mb: 3, borderRadius: 3 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {gastoEditandoId ? "Editar Gasto" : "Adicionar Gasto"}
                    </Typography>

                    <Box component="form" onSubmit={salvarGasto}>
                        <TextField
                            label="Descricao"
                            value={descricao}
                            onChange={event => setDescricao(event.target.value)}
                            placeholder="Ex: Mercado"
                            fullWidth
                            margin="normal"
                        />

                        <TextField
                            label="Valor"
                            type="number"
                            value={valor}
                            onChange={event => setValor(event.target.value)}
                            placeholder="Ex: 300"
                            fullWidth
                            margin="normal"
                        />

                        <TextField
                            label="Quem deve?"
                            value={devedor}
                            onChange={event => setDevedor(event.target.value)}
                            placeholder="Ex: Pai"
                            fullWidth
                            margin="normal"
                        />

                        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                            <Button type="submit" variant="contained">
                                {gastoEditandoId ? "Salvar Alteracoes" : "Salvar Gasto"}
                            </Button>

                            {gastoEditandoId && (
                                <Button type="button" variant="outlined" onClick={limparFormulario}>
                                    Cancelar
                                </Button>
                            )}
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <Typography variant="h6" fontWeight="bold" gutterBottom>
                Gastos
            </Typography>

            {gastos.length === 0 ? (
                <Typography>Nenhum gasto cadastrado.</Typography>
            ) : (
                gastos.map(gasto => (
                        <Card key={gasto.id} sx={{ mb: 2, borderRadius: 3 }}>
                            <CardContent>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: 1
                                    }}
                                >
                                    <Typography variant="h6" fontWeight="bold">
                                        {gasto.descricao}
                                    </Typography>

                                    <Chip
                                        label={gasto.pago ? "Pago" : "Pendente"}
                                        color={gasto.pago ? "success" : "warning"}
                                        size="small"
                                    />
                                </Box>

                                <Typography sx={{ mt: 1 }}>
                                    Valor: R$ {gasto.valor.toFixed(2)}
                                </Typography>

                                <Typography>Quem deve: {gasto.devedor}</Typography>

                                <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => alternarPago(gasto.id)}
                                    >
                                        {gasto.pago ? "Marcar pendente" : "Marcar pago"}
                                    </Button>

                                    <Button variant="outlined" size="small" onClick={() => editarGasto(gasto)}>
                                        Editar
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        onClick={() => excluirGasto(gasto.id)}
                                    >
                                        Excluir
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                ))
            )}
        </Container>
    );
}

export default DetalheFatura;
