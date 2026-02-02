import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/MinhasAtividades.css';

const MinhasAtividades = () => {
  const [atividades, setAtividades] = useState([]);
  const [redacoes, setRedacoes] = useState([]);
  const [atividadesFiltradas, setAtividadesFiltradas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Estados de filtro
  const [filtroCategoria, setFiltroCategoria] = useState('Exercícios'); // 'Exercícios' ou 'Redações'
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroBusca, setFiltroBusca] = useState('');

  // Estado de ordenação
  const [ordenacao, setOrdenacao] = useState({ campo: 'DT_INICIO', direcao: 'desc' });

  // Estados do modal
  const [modalAberto, setModalAberto] = useState(false);
  const [atividadeSelecionada, setAtividadeSelecionada] = useState(null);

  // Estados do modal de nova entrada
  const [modalNovaEntradaAberto, setModalNovaEntradaAberto] = useState(false);
  const [formularioNovaEntrada, setFormularioNovaEntrada] = useState({
    area: '',
    materia: '',
    assunto: '',
    questoes: '',
    acertos: '',
    tempo_total: '',
    dt_realizado: '',
    comentarios: ''
  });
  const [enviandoNovaEntrada, setEnviandoNovaEntrada] = useState(false);

  // Carregar atividades ao montar o componente
  useEffect(() => {
    carregarDados();
  }, []);

  // Aplicar filtros e ordenação quando dados ou filtros mudarem
  useEffect(() => {
    aplicarFiltrosEOrdenacao();
  }, [atividades, redacoes, filtroCategoria, filtroTipo, filtroBusca, ordenacao]);

  const carregarAtividades = async () => {
    console.log('🔄 Carregando exercícios...');

    try {
      const response = await fetch('/api/listar_exercicios');
      console.log('📥 Status da resposta (exercícios):', response.status);

      const data = await response.json();
      console.log('📊 Dados recebidos (exercícios):', data);

      if (response.ok && data.success) {
        setAtividades(data.data);
        console.log(`✅ ${data.data.length} exercícios carregados`);
      } else {
        throw new Error(data.error || 'Erro ao carregar exercícios');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar exercícios:', error);
      throw error;
    }
  };

  const carregarRedacoes = async () => {
    console.log('🔄 Carregando redações...');

    try {
      const response = await fetch('/api/listar_redacoes');
      console.log('📥 Status da resposta (redações):', response.status);

      const data = await response.json();
      console.log('📊 Dados recebidos (redações):', data);

      if (response.ok && data.success) {
        setRedacoes(data.data);
        console.log(`✅ ${data.data.length} redações carregadas`);
      } else {
        throw new Error(data.error || 'Erro ao carregar redações');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar redações:', error);
      throw error;
    }
  };

  const carregarDados = async () => {
    console.log('🔄 Carregando todos os dados...');
    setIsLoading(true);
    setErro('');

    try {
      await Promise.all([carregarAtividades(), carregarRedacoes()]);
      console.log('✅ Todos os dados carregados com sucesso');
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      setErro(`Erro ao carregar dados: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const aplicarFiltrosEOrdenacao = () => {
    // Selecionar dados baseado na categoria
    let resultado = filtroCategoria === 'Exercícios' ? [...atividades] : [...redacoes];

    // Filtro por tipo (apenas para Exercícios)
    if (filtroCategoria === 'Exercícios' && filtroTipo) {
      resultado = resultado.filter(a => a.TIPO === filtroTipo);
    }

    // Filtro por busca (ID e título)
    if (filtroBusca) {
      const busca = filtroBusca.toLowerCase();
      resultado = resultado.filter(a =>
        String(a.ID_ATIVIDADE).includes(busca) ||
        a.TITULO?.toLowerCase().includes(busca)
      );
    }

    // Ordenação
    resultado.sort((a, b) => {
      const { campo, direcao } = ordenacao;
      let valorA = a[campo] || '';
      let valorB = b[campo] || '';

      // Tratamento especial para números
      if (campo === 'ID_ATIVIDADE' || campo === 'QUESTOES' || campo === 'ACERTOS' ||
          campo === 'C1' || campo === 'C2' || campo === 'C3' || campo === 'C4' || campo === 'C5') {
        valorA = parseFloat(valorA) || 0;
        valorB = parseFloat(valorB) || 0;
      }

      // Tratamento especial para TOTAL (soma das competências)
      if (campo === 'TOTAL') {
        valorA = (a.C1 || 0) + (a.C2 || 0) + (a.C3 || 0) + (a.C4 || 0) + (a.C5 || 0);
        valorB = (b.C1 || 0) + (b.C2 || 0) + (b.C3 || 0) + (b.C4 || 0) + (b.C5 || 0);
      }

      // Tratamento especial para datas
      if (campo === 'DT_INICIO') {
        valorA = new Date(valorA.split('/').reverse().join('-')).getTime() || 0;
        valorB = new Date(valorB.split('/').reverse().join('-')).getTime() || 0;
      }

      if (valorA < valorB) return direcao === 'asc' ? -1 : 1;
      if (valorA > valorB) return direcao === 'asc' ? 1 : -1;
      return 0;
    });

    setAtividadesFiltradas(resultado);
  };

  const alternarOrdenacao = (campo) => {
    setOrdenacao(prev => ({
      campo,
      direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getIconeOrdenacao = (campo) => {
    if (ordenacao.campo !== campo) return '↕';
    return ordenacao.direcao === 'asc' ? '↑' : '↓';
  };

  const limparFiltros = () => {
    setFiltroTipo('');
    setFiltroBusca('');
  };

  const handleCategoriaChange = (categoria) => {
    setFiltroCategoria(categoria);
    setFiltroTipo(''); // Limpar filtro de tipo ao mudar categoria
  };

  const abrirDetalhes = (atividade) => {
    setAtividadeSelecionada(atividade);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setAtividadeSelecionada(null);
  };

  const abrirModalNovaEntrada = () => {
    setFormularioNovaEntrada({
      area: '',
      materia: '',
      assunto: '',
      questoes: '',
      acertos: '',
      tempo_total: '',
      dt_realizado: '',
      comentarios: ''
    });
    setModalNovaEntradaAberto(true);
  };

  const fecharModalNovaEntrada = () => {
    setModalNovaEntradaAberto(false);
    setFormularioNovaEntrada({
      area: '',
      materia: '',
      assunto: '',
      questoes: '',
      acertos: '',
      tempo_total: '',
      dt_realizado: '',
      comentarios: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Aplicar máscara de tempo (00:00) para o campo tempo_total
    if (name === 'tempo_total') {
      let valorLimpo = value.replace(/\D/g, ''); // Remove tudo que não é dígito

      if (valorLimpo.length > 4) {
        valorLimpo = valorLimpo.slice(0, 4); // Limita a 4 dígitos
      }

      let valorFormatado = '';
      if (valorLimpo.length > 0) {
        if (valorLimpo.length <= 2) {
          valorFormatado = valorLimpo;
        } else {
          valorFormatado = valorLimpo.slice(0, 2) + ':' + valorLimpo.slice(2);
        }
      }

      setFormularioNovaEntrada(prev => ({
        ...prev,
        [name]: valorFormatado
      }));
    } else if (name === 'dt_realizado') {
      // Aplicar máscara de data (00/00/0000) para o campo dt_realizado
      let valorLimpo = value.replace(/\D/g, ''); // Remove tudo que não é dígito

      if (valorLimpo.length > 8) {
        valorLimpo = valorLimpo.slice(0, 8); // Limita a 8 dígitos
      }

      let valorFormatado = '';
      if (valorLimpo.length > 0) {
        if (valorLimpo.length <= 2) {
          valorFormatado = valorLimpo;
        } else if (valorLimpo.length <= 4) {
          valorFormatado = valorLimpo.slice(0, 2) + '/' + valorLimpo.slice(2);
        } else {
          valorFormatado = valorLimpo.slice(0, 2) + '/' + valorLimpo.slice(2, 4) + '/' + valorLimpo.slice(4);
        }
      }

      setFormularioNovaEntrada(prev => ({
        ...prev,
        [name]: valorFormatado
      }));
    } else if (name === 'questoes' || name === 'acertos') {
      // Aceitar apenas números nos campos de questões e acertos
      const valorNumerico = value.replace(/\D/g, '');
      setFormularioNovaEntrada(prev => ({
        ...prev,
        [name]: valorNumerico
      }));
    } else {
      setFormularioNovaEntrada(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const submeterNovaEntrada = async (e) => {
    e.preventDefault();
    setEnviandoNovaEntrada(true);

    try {
      const isSimulado = atividadeSelecionada.TIPO === 'Simulado';
      const endpoint = isSimulado ? '/api/criar_simulado' : '/api/criar_questoes';

      const dados = {
        id_atividade: atividadeSelecionada.ID_ATIVIDADE,
        area: formularioNovaEntrada.area,
        questoes: parseInt(formularioNovaEntrada.questoes),
        acertos: parseInt(formularioNovaEntrada.acertos),
        tempo_total: formularioNovaEntrada.tempo_total,
        dt_realizado: formularioNovaEntrada.dt_realizado,
        comentarios: formularioNovaEntrada.comentarios
      };

      // Adicionar campos específicos para questões
      if (!isSimulado) {
        dados.materia = formularioNovaEntrada.materia;
        dados.assunto = formularioNovaEntrada.assunto;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert(`${isSimulado ? 'Simulado' : 'Bloco'} criado com sucesso!`);
        fecharModalNovaEntrada();
        // Recarregar atividades para atualizar os dados
        await carregarAtividades();
        // Reabrir o modal de detalhes com os dados atualizados
        const atividadeAtualizada = await buscarAtividadeAtualizada(atividadeSelecionada.ID_ATIVIDADE);
        if (atividadeAtualizada) {
          setAtividadeSelecionada(atividadeAtualizada);
        }
      } else {
        throw new Error(result.error || 'Erro ao criar entrada');
      }
    } catch (error) {
      console.error('Erro ao submeter nova entrada:', error);
      alert(`Erro ao criar entrada: ${error.message}`);
    } finally {
      setEnviandoNovaEntrada(false);
    }
  };

  const buscarAtividadeAtualizada = async (idAtividade) => {
    try {
      const response = await fetch('/api/listar_exercicios');
      const data = await response.json();
      if (response.ok && data.success) {
        return data.data.find(a => a.ID_ATIVIDADE === idAtividade);
      }
    } catch (error) {
      console.error('Erro ao buscar atividade atualizada:', error);
    }
    return null;
  };

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="minhas-atividades-container">
        {/* Header Fixo */}
        <header className="page-header">
          <button
            className="menu-button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            ☰
          </button>
          <h1 className="page-titulo">Minhas Atividades 📋</h1>
          <div className="header-actions">
            <span className="contador-atividades">
              {atividadesFiltradas.length} de {filtroCategoria === 'Exercícios' ? atividades.length : redacoes.length}
            </span>
            <button onClick={carregarDados} className="botao-recarregar" disabled={isLoading}>
              {isLoading ? '🔄' : '↻'}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="page-main">
          <div className="main-content">

          {/* Filtros */}
          <div className="filtros">
            <div className="filtro-grupo">
              <input
                type="text"
                placeholder="🔍 Buscar por ID ou título..."
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
                className="filtro-busca"
              />
            </div>

            <div className="filtro-grupo">
              <select
                value={filtroCategoria}
                onChange={(e) => handleCategoriaChange(e.target.value)}
                className="filtro-select"
              >
                <option value="Exercícios">Exercícios</option>
                <option value="Redações">Redações</option>
              </select>

              {filtroCategoria === 'Exercícios' && (
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  className="filtro-select"
                >
                  <option value="">Todos os tipos</option>
                  <option value="Simulado">Simulado</option>
                  <option value="Questões">Questões</option>
                </select>
              )}

              {(filtroTipo || filtroBusca) && (
                <button onClick={limparFiltros} className="botao-limpar-filtros">
                  Limpar filtros
                </button>
              )}
            </div>
          </div>

          {/* Mensagens de erro */}
          {erro && (
            <div className="mensagem mensagem-erro">
              {erro}
            </div>
          )}

          {/* Loading */}
          {isLoading ? (
            <div className="loading">Carregando atividades...</div>
          ) : atividadesFiltradas.length === 0 ? (
            <div className="vazio">
              {atividades.length === 0
                ? 'Nenhuma atividade encontrada. Crie sua primeira atividade!'
                : 'Nenhuma atividade encontrada com os filtros aplicados.'}
            </div>
          ) : (
            /* Tabela de atividades */
            <div className="tabela-container">
              <table className="tabela-atividades">
                <thead>
                  <tr>
                    <th onClick={() => alternarOrdenacao('ID_ATIVIDADE')}>
                      ID {getIconeOrdenacao('ID_ATIVIDADE')}
                    </th>
                    <th onClick={() => alternarOrdenacao('TITULO')}>
                      Título {getIconeOrdenacao('TITULO')}
                    </th>
                    <th onClick={() => alternarOrdenacao('TIPO')}>
                      Tipo {getIconeOrdenacao('TIPO')}
                    </th>

                    {/* Colunas específicas para Exercícios */}
                    {filtroCategoria === 'Exercícios' && (
                      <>
                        <th onClick={() => alternarOrdenacao('QUESTOES')}>
                          Questões {getIconeOrdenacao('QUESTOES')}
                        </th>
                        <th onClick={() => alternarOrdenacao('ACERTOS')}>
                          Acertos {getIconeOrdenacao('ACERTOS')}
                        </th>
                        <th>Aproveitamento</th>
                      </>
                    )}

                    {/* Colunas específicas para Redações */}
                    {filtroCategoria === 'Redações' && (
                      <>
                        <th onClick={() => alternarOrdenacao('C1')}>
                          C1 {getIconeOrdenacao('C1')}
                        </th>
                        <th onClick={() => alternarOrdenacao('C2')}>
                          C2 {getIconeOrdenacao('C2')}
                        </th>
                        <th onClick={() => alternarOrdenacao('C3')}>
                          C3 {getIconeOrdenacao('C3')}
                        </th>
                        <th onClick={() => alternarOrdenacao('C4')}>
                          C4 {getIconeOrdenacao('C4')}
                        </th>
                        <th onClick={() => alternarOrdenacao('C5')}>
                          C5 {getIconeOrdenacao('C5')}
                        </th>
                        <th onClick={() => alternarOrdenacao('TOTAL')}>
                          Total {getIconeOrdenacao('TOTAL')}
                        </th>
                      </>
                    )}

                    <th onClick={() => alternarOrdenacao('DT_INICIO')}>
                      Data de Início {getIconeOrdenacao('DT_INICIO')}
                    </th>
                    {filtroCategoria === 'Exercícios' && <th>Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {atividadesFiltradas.map((atividade) => {
                    const percentual = atividade.QUESTOES ?
                      ((atividade.ACERTOS / atividade.QUESTOES) * 100).toFixed(1) : 0;

                    return (
                      <tr key={atividade.ID_ATIVIDADE}>
                        <td className="celula-numero">{atividade.ID_ATIVIDADE}</td>
                        <td className="celula-titulo">{atividade.TITULO}</td>
                        <td>
                          <span className={`badge badge-${atividade.TIPO?.toLowerCase()}`}>
                            {atividade.TIPO}
                          </span>
                        </td>

                        {/* Células específicas para Exercícios */}
                        {filtroCategoria === 'Exercícios' && (
                          <>
                            <td className="celula-numero">{atividade.QUESTOES || '-'}</td>
                            <td className="celula-numero">{atividade.ACERTOS || '-'}</td>
                            <td className="celula-percentual">
                              {atividade.QUESTOES ? (
                                <span className={`percentual ${percentual >= 70 ? 'bom' : percentual >= 50 ? 'medio' : 'baixo'}`}>
                                  {percentual}%
                                </span>
                              ) : '-'}
                            </td>
                          </>
                        )}

                        {/* Células específicas para Redações */}
                        {filtroCategoria === 'Redações' && (
                          <>
                            <td className="celula-numero">{atividade.C1 || '-'}</td>
                            <td className="celula-numero">{atividade.C2 || '-'}</td>
                            <td className="celula-numero">{atividade.C3 || '-'}</td>
                            <td className="celula-numero">{atividade.C4 || '-'}</td>
                            <td className="celula-numero">{atividade.C5 || '-'}</td>
                            <td className="celula-numero celula-total">
                              {(() => {
                                const total = (atividade.C1 || 0) + (atividade.C2 || 0) +
                                              (atividade.C3 || 0) + (atividade.C4 || 0) +
                                              (atividade.C5 || 0);
                                return total > 0 ? total : '-';
                              })()}
                            </td>
                          </>
                        )}

                        <td className="celula-data">{atividade.DT_INICIO}</td>
                        {filtroCategoria === 'Exercícios' && (
                          <td>
                            <button
                              className="botao-detalhes"
                              onClick={() => abrirDetalhes(atividade)}
                            >
                              Ver Detalhes
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          </div>
        </main>
      </div>

      {/* Modal de Detalhes */}
      {modalAberto && atividadeSelecionada && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-conteudo" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                Detalhes - {atividadeSelecionada.TITULO}
              </h2>
              <div className="modal-header-actions">
                <button
                  className="modal-adicionar"
                  onClick={abrirModalNovaEntrada}
                  title={`Adicionar ${atividadeSelecionada.TIPO === 'Simulado' ? 'Simulado' : 'Bloco'}`}
                >
                  +
                </button>
                <button className="modal-fechar" onClick={fecharModal}>
                  ✕
                </button>
              </div>
            </div>

            <div className="modal-body">
              {atividadeSelecionada.TIPO === 'Simulado' ? (
                /* Modal de Simulados */
                <div className="tabela-container">
                  <table className="tabela-detalhes">
                    <thead>
                      <tr>
                        <th>ID Simulado</th>
                        <th>Área</th>
                        <th>Questões</th>
                        <th>Acertos</th>
                        <th>Aproveitamento</th>
                        <th>Tempo Total</th>
                        <th>Comentários</th>
                        <th>Data Realizado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {atividadeSelecionada.INFO?.map((simulado, index) => {
                        const percentual = ((simulado.ACERTOS / simulado.QUESTOES) * 100).toFixed(1);
                        return (
                          <tr key={index}>
                            <td>{simulado.ID_SIMULADO}</td>
                            <td>{simulado.AREA}</td>
                            <td className="celula-numero">{simulado.QUESTOES}</td>
                            <td className="celula-numero">{simulado.ACERTOS}</td>
                            <td className="celula-percentual">
                              <span className={`percentual ${percentual >= 70 ? 'bom' : percentual >= 50 ? 'medio' : 'baixo'}`}>
                                {percentual}%
                              </span>
                            </td>
                            <td>{simulado.TEMPO_TOTAL}</td>
                            <td className="celula-comentarios">{simulado.COMENTARIOS || '-'}</td>
                            <td className="celula-data">{simulado.DT_REALIZADO}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Modal de Questões */
                <div className="tabela-container">
                  <table className="tabela-detalhes">
                    <thead>
                      <tr>
                        <th>ID Bloco</th>
                        <th>Área</th>
                        <th>Matéria</th>
                        <th>Assunto</th>
                        <th>Questões</th>
                        <th>Acertos</th>
                        <th>Aproveitamento</th>
                        <th>Tempo Total</th>
                        <th>Comentários</th>
                        <th>Data Realizado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {atividadeSelecionada.INFO?.map((questao, index) => {
                        const percentual = ((questao.ACERTOS / questao.QUESTOES) * 100).toFixed(1);
                        return (
                          <tr key={index}>
                            <td>{questao.ID_QUESTOES}</td>
                            <td>{questao.AREA}</td>
                            <td>{questao.MATERIA}</td>
                            <td>{questao.ASSUNTO}</td>
                            <td className="celula-numero">{questao.QUESTOES}</td>
                            <td className="celula-numero">{questao.ACERTOS}</td>
                            <td className="celula-percentual">
                              <span className={`percentual ${percentual >= 70 ? 'bom' : percentual >= 50 ? 'medio' : 'baixo'}`}>
                                {percentual}%
                              </span>
                            </td>
                            <td>{questao.TEMPO_TOTAL}</td>
                            <td className="celula-comentarios">{questao.COMENTARIOS || '-'}</td>
                            <td className="celula-data">{questao.DT_REALIZADO}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nova Entrada (Simulado ou Bloco) */}
      {modalNovaEntradaAberto && atividadeSelecionada && (
        <div className="modal-overlay" onClick={fecharModalNovaEntrada}>
          <div className="modal-conteudo modal-form" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {atividadeSelecionada.TIPO === 'Simulado' ? 'Novo Simulado' : 'Novo Bloco'}
              </h2>
              <button className="modal-fechar" onClick={fecharModalNovaEntrada}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={submeterNovaEntrada} className="form-nova-entrada">
                <div className="form-group">
                  <label htmlFor="area">Área *</label>
                  <input
                    type="text"
                    id="area"
                    name="area"
                    value={formularioNovaEntrada.area}
                    onChange={handleInputChange}
                    required
                    placeholder="Ex: Linguagens"
                  />
                </div>

                {atividadeSelecionada.TIPO !== 'Simulado' && (
                  <>
                    <div className="form-group">
                      <label htmlFor="materia">Matéria *</label>
                      <input
                        type="text"
                        id="materia"
                        name="materia"
                        value={formularioNovaEntrada.materia}
                        onChange={handleInputChange}
                        required
                        placeholder="Ex: Português"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="assunto">Assunto *</label>
                      <input
                        type="text"
                        id="assunto"
                        name="assunto"
                        value={formularioNovaEntrada.assunto}
                        onChange={handleInputChange}
                        required
                        placeholder="Ex: Gramática"
                      />
                    </div>
                  </>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="questoes">Questões *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="questoes"
                      name="questoes"
                      className="input-sem-setas"
                      value={formularioNovaEntrada.questoes}
                      onChange={handleInputChange}
                      required
                      pattern="[0-9]*"
                      placeholder="Ex: 45"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="acertos">Acertos *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="acertos"
                      name="acertos"
                      className="input-sem-setas"
                      value={formularioNovaEntrada.acertos}
                      onChange={handleInputChange}
                      required
                      pattern="[0-9]*"
                      placeholder="Ex: 42"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="tempo_total">Tempo Total *</label>
                    <input
                      type="text"
                      id="tempo_total"
                      name="tempo_total"
                      value={formularioNovaEntrada.tempo_total}
                      onChange={handleInputChange}
                      required
                      maxLength="5"
                      pattern="[0-9]{2}:[0-9]{2}"
                      placeholder="00:00"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="dt_realizado">Data Realizado *</label>
                  <input
                    type="text"
                    id="dt_realizado"
                    name="dt_realizado"
                    value={formularioNovaEntrada.dt_realizado}
                    onChange={handleInputChange}
                    required
                    maxLength="10"
                    pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}"
                    placeholder="00/00/0000"
                    inputMode="numeric"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="comentarios">Comentários</label>
                  <textarea
                    id="comentarios"
                    name="comentarios"
                    value={formularioNovaEntrada.comentarios}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Comentários opcionais sobre a atividade..."
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="botao-cancelar"
                    onClick={fecharModalNovaEntrada}
                    disabled={enviandoNovaEntrada}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="botao-salvar"
                    disabled={enviandoNovaEntrada}
                  >
                    {enviandoNovaEntrada ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MinhasAtividades;
