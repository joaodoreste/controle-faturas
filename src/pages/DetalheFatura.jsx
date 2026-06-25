import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    MenuItem,
    Tab,
    Tabs,
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
import {
    calcularValorPagoGasto,
    calcularValorPendenteGasto,
    obterPagamentosGasto,
    obterStatusGasto
} from "../utils/pagamentos";

function DetalheFatura() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [aba, setAba] = useState(0);
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
    const [gastoPagamentoId, setGastoPagamentoId] = useState("");
    const [valorRecebido, setValorRecebido] = useState("");
    const [dataRecebimento, setDataRecebimento] = useState(
        new Date().toISOString().slice(0, 10)
    );
    const [recebimentoEditando, setRecebimentoEditando] = useState(null);
    const [valorPagamento, setValorPagamento] = useState("");
    const [dataPagamento, setDataPagamento] = useState(
        new Date().toISOString().slice(0, 10)
    );
    const [pagamentoMinhaParteEditandoId, setPagamentoMinhaParteEditandoId] = useState(null);

    const faturas = buscarFaturas();
    const fatura = faturas.find(item => String(item.id) === String(id));

    function limparFormulario() {
        setDescricao("");
        setValor("");
        setDevedor("");
        setGastoEditandoId(null);
    }

    function limparRecebimento() {
        setGastoPagamentoId("");
        setValorRecebido("");
        setDataRecebimento(new Date().toISOString().slice(0, 10));
        setRecebimentoEditando(null);
    }

    function limparPagamentoMinhaParte() {
        setValorPagamento("");
        setDataPagamento(new Date().toISOString().slice(0, 10));
        setPagamentoMinhaParteEditandoId(null);
    }

    function atualizarGastos(gastosAtualizados) {
        salvarGastos(gastosAtualizados);
        setGastos(
            gastosAtualizados.filter(gasto => String(gasto.faturaId) === String(id))
        );
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

        if (dadosGasto.valor <= 0) {
            alert("Informe um valor maior que zero.");
            return;
        }

        const todosGastos = buscarGastos();

        if (gastoEditandoId) {
            const gastosAtualizados = todosGastos.map(gasto => {
                if (gasto.id !== gastoEditandoId) {
                    return gasto;
                }

                const gastoAtualizado = {
                    ...gasto,
                    ...dadosGasto
                };

                return {
                    ...gastoAtualizado,
                    pago: calcularValorPendenteGasto(gastoAtualizado) <= 0
                };
            });

            atualizarGastos(gastosAtualizados);
            limparFormulario();
            return;
        }

        const novoGasto = {
            id: Date.now(),
            faturaId: Number(id),
            ...dadosGasto,
            pago: false,
            pagamentos: []
        };

        atualizarGastos([...todosGastos, novoGasto]);
        limparFormulario();
    }

    function editarGasto(gasto) {
        setGastoEditandoId(gasto.id);
        setDescricao(gasto.descricao);
        setValor(String(gasto.valor));
        setDevedor(gasto.devedor);
        setAba(2);
    }

    function registrarPagamentoRecebido(event) {
        event.preventDefault();

        if (!gastoPagamentoId || !valorRecebido || !dataRecebimento) {
            alert("Informe o gasto, o valor recebido e a data.");
            return;
        }

        const gastoSelecionado = gastos.find(
            gasto => String(gasto.id) === String(gastoPagamentoId)
        );

        if (!gastoSelecionado) {
            alert("Gasto nao encontrado.");
            return;
        }

        const valorConvertido = Number(valorRecebido);
        const pagamentoOriginal = recebimentoEditando
            ? obterPagamentosGasto(gastoSelecionado).find(
                pagamento => pagamento.id === recebimentoEditando.pagamentoId
            )
            : null;
        const limiteRecebimento = calcularValorPendenteGasto(gastoSelecionado) + Number(pagamentoOriginal?.valor || 0);

        if (valorConvertido <= 0) {
            alert("Informe um valor maior que zero.");
            return;
        }

        if (valorConvertido > limiteRecebimento) {
            alert("O valor recebido nao pode ser maior que o valor pendente.");
            return;
        }

        const novoPagamento = {
            id: recebimentoEditando?.pagamentoId || Date.now(),
            valor: valorConvertido,
            data: dataRecebimento
        };

        const todosGastos = buscarGastos();
        const gastosAtualizados = todosGastos.map(gasto => {
            if (String(gasto.id) !== String(gastoPagamentoId)) {
                return gasto;
            }

            const pagamentos = recebimentoEditando
                ? obterPagamentosGasto(gasto).map(pagamento =>
                    pagamento.id === recebimentoEditando.pagamentoId
                        ? novoPagamento
                        : pagamento
                )
                : [...obterPagamentosGasto(gasto), novoPagamento];
            const gastoAtualizado = {
                ...gasto,
                pagamentos
            };

            return {
                ...gastoAtualizado,
                pago: calcularValorPendenteGasto(gastoAtualizado) <= 0
            };
        });

        atualizarGastos(gastosAtualizados);
        limparRecebimento();
    }

    function editarPagamentoRecebido(gasto, pagamento) {
        setGastoPagamentoId(String(gasto.id));
        setValorRecebido(String(pagamento.valor));
        setDataRecebimento(pagamento.data);
        setRecebimentoEditando({
            gastoId: gasto.id,
            pagamentoId: pagamento.id
        });
        setAba(2);
    }

    function quitarGasto(gastoId) {
        const todosGastos = buscarGastos();

        const gastosAtualizados = todosGastos.map(gasto => {
            if (gasto.id !== gastoId) {
                return gasto;
            }

            const faltaReceber = calcularValorPendenteGasto(gasto);

            if (faltaReceber <= 0) {
                return {
                    ...gasto,
                    pago: true
                };
            }

            const pagamentos = [
                ...obterPagamentosGasto(gasto),
                {
                    id: Date.now(),
                    valor: faltaReceber,
                    data: new Date().toISOString().slice(0, 10)
                }
            ];

            return {
                ...gasto,
                pagamentos,
                pago: true
            };
        });

        atualizarGastos(gastosAtualizados);
    }

    function excluirPagamentoRecebido(gastoId, pagamentoId) {
        const confirmar = confirm("Tem certeza que deseja excluir esse recebimento?");
        if (!confirmar) return;

        const todosGastos = buscarGastos();
        const gastosAtualizados = todosGastos.map(gasto => {
            if (gasto.id !== gastoId) {
                return gasto;
            }

            const pagamentos = obterPagamentosGasto(gasto).filter(
                pagamento => pagamento.id !== pagamentoId
            );
            const gastoAtualizado = {
                ...gasto,
                pagamentos
            };

            return {
                ...gastoAtualizado,
                pago: calcularValorPendenteGasto(gastoAtualizado) <= 0
            };
        });

        atualizarGastos(gastosAtualizados);
    }

    function limparPagamentosRecebidos(gastoId) {
        const confirmar = confirm("Deseja remover todos os recebimentos desse gasto?");
        if (!confirmar) return;

        const gastosAtualizados = buscarGastos().map(gasto =>
            gasto.id === gastoId
                ? {
                    ...gasto,
                    pagamentos: [],
                    pago: false
                }
                : gasto
        );

        atualizarGastos(gastosAtualizados);
    }

    function excluirGasto(gastoId) {
        const confirmar = confirm("Tem certeza que deseja excluir esse gasto?");
        if (!confirmar) return;

        const gastosAtualizados = buscarGastos().filter(
            gasto => gasto.id !== gastoId
        );

        atualizarGastos(gastosAtualizados);

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

        const pagamentoOriginal = pagamentosMinhaParte.find(
            pagamento => pagamento.id === pagamentoMinhaParteEditandoId
        );
        const limitePagamento = faltaEuPagar + Number(pagamentoOriginal?.valor || 0);

        if (valorConvertido > limitePagamento) {
            alert("O valor pago nao pode ser maior que o valor que falta pagar.");
            return;
        }

        const novoPagamento = {
            id: pagamentoMinhaParteEditandoId || Date.now(),
            faturaId: Number(id),
            valor: valorConvertido,
            data: dataPagamento
        };

        const pagamentosAtualizados = pagamentoMinhaParteEditandoId
            ? buscarPagamentosMinhaParte().map(pagamento =>
                pagamento.id === pagamentoMinhaParteEditandoId
                    ? novoPagamento
                    : pagamento
            )
            : [
                ...buscarPagamentosMinhaParte(),
                novoPagamento
            ];

        salvarPagamentosMinhaParte(pagamentosAtualizados);
        setPagamentosMinhaParte(
            pagamentosAtualizados.filter(
                pagamento => String(pagamento.faturaId) === String(id)
            )
        );
        limparPagamentoMinhaParte();
    }

    function editarPagamentoMinhaParte(pagamento) {
        setPagamentoMinhaParteEditandoId(pagamento.id);
        setValorPagamento(String(pagamento.valor));
        setDataPagamento(pagamento.data);
        setAba(3);
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

    const totalQueDevem = gastos.reduce(
        (total, gasto) => total + Number(gasto.valor || 0),
        0
    );

    const totalPago = gastos.reduce(
        (total, gasto) => total + calcularValorPagoGasto(gasto),
        0
    );

    const totalPendente = Math.max(totalQueDevem - totalPago, 0);
    const minhaParte = fatura.valorTotal - totalQueDevem;

    const totalPagoPorMim = pagamentosMinhaParte.reduce(
        (total, pagamento) => total + Number(pagamento.valor || 0),
        0
    );

    const faltaEuPagar = Math.max(minhaParte - totalPagoPorMim, 0);

    const pagamentosMinhaParteOrdenados = [...pagamentosMinhaParte].sort(
        (a, b) => String(b.data).localeCompare(String(a.data))
    );
    const gastosPendentes = gastos.filter(
        gasto => calcularValorPendenteGasto(gasto) > 0
    );
    const gastosDisponiveisRecebimento = recebimentoEditando
        ? gastos.filter(gasto => gasto.id === recebimentoEditando.gastoId)
        : gastosPendentes;
    const gastosComPagamentoMaiorQueValor = gastos.filter(
        gasto => calcularValorPagoGasto(gasto) > Number(gasto.valor || 0)
    );
    const avisos = [
        totalQueDevem > fatura.valorTotal
            ? `A soma do que pessoas devem passou do valor total da fatura em R$ ${(totalQueDevem - fatura.valorTotal).toFixed(2)}.`
            : null,
        minhaParte < 0
            ? "Sua parte ficou negativa porque as pessoas devem mais do que o total da fatura."
            : null,
        totalPagoPorMim > minhaParte && minhaParte >= 0
            ? `Voce registrou R$ ${(totalPagoPorMim - minhaParte).toFixed(2)} a mais na sua parte.`
            : null,
        totalPago > totalQueDevem
            ? `Os recebimentos registrados passaram o total devido em R$ ${(totalPago - totalQueDevem).toFixed(2)}.`
            : null,
        gastosComPagamentoMaiorQueValor.length > 0
            ? `${gastosComPagamentoMaiorQueValor.length} gasto(s) tem recebimento maior que o valor devido.`
            : null
    ].filter(Boolean);

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

            <Tabs
                value={aba}
                onChange={(event, novaAba) => setAba(novaAba)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
            >
                <Tab label="Resumo" />
                <Tab label="Pessoas" />
                <Tab label="Gastos" />
                <Tab label="Minha parte" />
            </Tabs>

            {aba === 0 && (
                <Card sx={{ mb: 3, borderRadius: 3 }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Resumo da Fatura
                        </Typography>

                        {avisos.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                                {avisos.map(aviso => (
                                    <Alert key={aviso} severity="warning" sx={{ mb: 1 }}>
                                        {aviso}
                                    </Alert>
                                ))}
                            </Box>
                        )}

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 2
                            }}
                        >
                            <Box>
                                <Typography color="text.secondary">
                                    Pessoas me devem
                                </Typography>
                                <Typography fontWeight="bold">
                                    R$ {totalQueDevem.toFixed(2)}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography color="text.secondary">
                                    Ja recebi
                                </Typography>
                                <Typography fontWeight="bold">
                                    R$ {totalPago.toFixed(2)}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography color="text.secondary">
                                    Falta receber
                                </Typography>
                                <Typography fontWeight="bold" color="warning.main">
                                    R$ {totalPendente.toFixed(2)}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography color="text.secondary">
                                    Minha parte
                                </Typography>
                                <Typography fontWeight="bold">
                                    R$ {minhaParte.toFixed(2)}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography color="text.secondary">
                                    Ja paguei
                                </Typography>
                                <Typography fontWeight="bold">
                                    R$ {totalPagoPorMim.toFixed(2)}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography color="text.secondary">
                                    Falta eu pagar
                                </Typography>
                                <Typography fontWeight="bold" color="warning.main">
                                    R$ {faltaEuPagar.toFixed(2)}
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            )}

            {aba === 1 && <ResumoPorPessoa gastos={gastos} />}

            {aba === 2 && (
                <>
                    <Card sx={{ mb: 3, borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Registrar Recebimento
                            </Typography>

                            <Box component="form" onSubmit={registrarPagamentoRecebido}>
                                <TextField
                                    select
                                    label="Gasto"
                                    value={gastoPagamentoId}
                                    onChange={event => setGastoPagamentoId(event.target.value)}
                                    fullWidth
                                    margin="normal"
                                    disabled={Boolean(recebimentoEditando)}
                                >
                                    {gastosDisponiveisRecebimento.map(gasto => (
                                        <MenuItem key={gasto.id} value={gasto.id}>
                                            {gasto.devedor} - {gasto.descricao} - falta R$ {calcularValorPendenteGasto(gasto).toFixed(2)}
                                        </MenuItem>
                                    ))}
                                </TextField>

                                <TextField
                                    label="Valor recebido"
                                    type="number"
                                    value={valorRecebido}
                                    onChange={event => setValorRecebido(event.target.value)}
                                    placeholder="Ex: 100"
                                    fullWidth
                                    margin="normal"
                                />

                                <TextField
                                    label="Data do recebimento"
                                    type="date"
                                    value={dataRecebimento}
                                    onChange={event => setDataRecebimento(event.target.value)}
                                    fullWidth
                                    margin="normal"
                                    InputLabelProps={{ shrink: true }}
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{ mt: 1 }}
                                    disabled={gastosDisponiveisRecebimento.length === 0}
                                >
                                    {recebimentoEditando ? "Salvar Recebimento" : "Registrar Recebimento"}
                                </Button>

                                {recebimentoEditando && (
                                    <Button
                                        type="button"
                                        variant="outlined"
                                        sx={{ mt: 1, ml: 1 }}
                                        onClick={limparRecebimento}
                                    >
                                        Cancelar
                                    </Button>
                                )}
                            </Box>
                        </CardContent>
                    </Card>

                    <Card sx={{ mb: 3, borderRadius: 3 }}>
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

                                <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
                                    <Button type="submit" variant="contained">
                                        {gastoEditandoId ? "Salvar Alteracoes" : "Salvar Gasto"}
                                    </Button>

                                    {gastoEditandoId && (
                                        <Button
                                            type="button"
                                            variant="outlined"
                                            onClick={limparFormulario}
                                        >
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
                        gastos.map(gasto => {
                            const status = obterStatusGasto(gasto);
                            const valorPago = calcularValorPagoGasto(gasto);
                            const valorPendente = calcularValorPendenteGasto(gasto);
                            const pagamentos = obterPagamentosGasto(gasto);

                            return (
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
                                                label={status.label}
                                                color={status.color}
                                                size="small"
                                            />
                                        </Box>

                                        <Typography sx={{ mt: 1 }}>
                                            Quem deve: {gasto.devedor}
                                        </Typography>
                                        <Typography>
                                            Total: R$ {Number(gasto.valor || 0).toFixed(2)}
                                        </Typography>
                                        <Typography>
                                            Recebido: R$ {valorPago.toFixed(2)}
                                        </Typography>
                                        <Typography fontWeight="bold" color={valorPendente > 0 ? "warning.main" : "success.main"}>
                                            Falta receber: R$ {valorPendente.toFixed(2)}
                                        </Typography>

                                        {pagamentos.length > 0 && (
                                            <Box sx={{ mt: 2 }}>
                                                <Typography fontWeight="bold">
                                                    Historico de recebimentos
                                                </Typography>

                                                {pagamentos.map(pagamento => (
                                                    <Box
                                                        key={pagamento.id}
                                                        sx={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "center",
                                                            gap: 1,
                                                            py: 1,
                                                            borderTop: "1px solid",
                                                            borderColor: "divider"
                                                        }}
                                                    >
                                                        <Box>
                                                            <Typography>
                                                                R$ {Number(pagamento.valor || 0).toFixed(2)}
                                                            </Typography>
                                                            <Typography color="text.secondary">
                                                                {formatarData(pagamento.data)}
                                                            </Typography>
                                                        </Box>

                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() =>
                                                                editarPagamentoRecebido(gasto, pagamento)
                                                            }
                                                        >
                                                            Editar
                                                        </Button>

                                                        <Button
                                                            variant="outlined"
                                                            color="error"
                                                            size="small"
                                                            onClick={() =>
                                                                excluirPagamentoRecebido(gasto.id, pagamento.id)
                                                            }
                                                        >
                                                            Excluir
                                                        </Button>
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}

                                        <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
                                            {valorPendente > 0 && (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => quitarGasto(gasto.id)}
                                                >
                                                    Marcar quitado
                                                </Button>
                                            )}

                                            {valorPago > 0 && (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => limparPagamentosRecebidos(gasto.id)}
                                                >
                                                    Limpar recebimentos
                                                </Button>
                                            )}

                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => editarGasto(gasto)}
                                            >
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
                            );
                        })
                    )}
                </>
            )}

            {aba === 3 && (
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
                                {pagamentoMinhaParteEditandoId ? "Salvar Pagamento" : "Marcar como pago"}
                            </Button>

                            {pagamentoMinhaParteEditandoId && (
                                <Button
                                    type="button"
                                    variant="outlined"
                                    sx={{ mt: 1, ml: 1 }}
                                    onClick={limparPagamentoMinhaParte}
                                >
                                    Cancelar
                                </Button>
                            )}
                        </Box>

                        <Box sx={{ mt: 2 }}>
                            {pagamentosMinhaParteOrdenados.length === 0 ? (
                                <Typography color="text.secondary">
                                    Nenhum pagamento registrado.
                                </Typography>
                            ) : (
                                pagamentosMinhaParteOrdenados.map(pagamento => (
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
                                            size="small"
                                            onClick={() => editarPagamentoMinhaParte(pagamento)}
                                        >
                                            Editar
                                        </Button>

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
            )}
        </Container>
    );
}

export default DetalheFatura;
