import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/NovaAtividade.css';

const NovaAtividade = () => {
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: '',
    dt_inicio: '',
    tempo_total: '',
    comentarios: '',
    area: '',
    materia: '',
    assunto: '',
    questoes: '',
    acertos: '',
    c1: '',
    c2: '',
    c3: '',
    c4: '',
    c5: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Tipos de atividade disponíveis
  const tiposAtividade = [
    'Simulado',
    'Questões',
    'Redação'
  ];

  // Áreas do conhecimento para simulados
  const areasConhecimento = [
    'Humanas',
    'Natureza',
    'Matemática',
    'Linguagens'
  ];

  const formatarTempo = (value) => {
    // Remove tudo que não é número
    const numeros = value.replace(/\D/g, '');

    // Limita a 4 dígitos
    const limitado = numeros.slice(0, 4);

    // Aplica a máscara 00:00
    if (limitado.length <= 2) {
      return limitado;
    }
    return `${limitado.slice(0, 2)}:${limitado.slice(2)}`;
  };

  const formatarData = (value) => {
    // Remove tudo que não é número
    const numeros = value.replace(/\D/g, '');

    // Limita a 8 dígitos
    const limitado = numeros.slice(0, 8);

    // Aplica a máscara 00/00/0000
    if (limitado.length <= 2) {
      return limitado;
    } else if (limitado.length <= 4) {
      return `${limitado.slice(0, 2)}/${limitado.slice(2)}`;
    } else {
      return `${limitado.slice(0, 2)}/${limitado.slice(2, 4)}/${limitado.slice(4)}`;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Aplica máscara se for o campo tempo_total
    let valorFinal = value;
    if (name === 'tempo_total') {
      valorFinal = formatarTempo(value);
    } else if (name === 'dt_inicio') {
      valorFinal = formatarData(value);
    } else if (['c1', 'c2', 'c3', 'c4', 'c5'].includes(name)) {
      // Campos de competência: apenas números, máximo 200
      const valorNumerico = value.replace(/\D/g, '');
      const valorInt = parseInt(valorNumerico) || 0;
      valorFinal = valorInt > 200 ? '200' : valorNumerico;
    }

    console.log('📝 Campo alterado:', name, '=', valorFinal);
    setFormData(prev => ({
      ...prev,
      [name]: valorFinal
    }));
  };

  const validarFormulario = () => {
    console.log('🔍 Validando formulário:', formData);

    if (!formData.titulo.trim()) {
      console.error('❌ Validação falhou: título vazio');
      setMensagem({ tipo: 'erro', texto: 'O título é obrigatório' });
      return false;
    }
    if (!formData.tipo) {
      console.error('❌ Validação falhou: tipo não selecionado');
      setMensagem({ tipo: 'erro', texto: 'Selecione o tipo da atividade' });
      return false;
    }
    if (!formData.dt_inicio) {
      console.error('❌ Validação falhou: data de início não preenchida');
      setMensagem({ tipo: 'erro', texto: 'A data de início é obrigatória' });
      return false;
    }
    // Validar formato da data (deve ser 00/00/0000)
    const regexData = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regexData.test(formData.dt_inicio)) {
      console.error('❌ Validação falhou: formato de data inválido');
      setMensagem({ tipo: 'erro', texto: 'A data deve estar no formato 00/00/0000 (dia/mês/ano)' });
      return false;
    }
    // Validar se a data é válida
    const [dia, mes, ano] = formData.dt_inicio.split('/').map(Number);
    if (dia < 1 || dia > 31 || mes < 1 || mes > 12 || ano < 1900 || ano > 2100) {
      console.error('❌ Validação falhou: data inválida');
      setMensagem({ tipo: 'erro', texto: 'Data inválida. Verifique dia, mês e ano' });
      return false;
    }
    if (!formData.tempo_total) {
      console.error('❌ Validação falhou: tempo total não preenchido');
      setMensagem({ tipo: 'erro', texto: 'O tempo total é obrigatório' });
      return false;
    }
    // Validar formato do tempo (deve ser 00:00)
    const regexTempo = /^\d{2}:\d{2}$/;
    if (!regexTempo.test(formData.tempo_total)) {
      console.error('❌ Validação falhou: formato de tempo inválido');
      setMensagem({ tipo: 'erro', texto: 'O tempo deve estar no formato 00:00 (horas:minutos)' });
      return false;
    }
    // Validar se os minutos são válidos (00-59)
    const [, minutos] = formData.tempo_total.split(':').map(Number);
    if (minutos > 59) {
      console.error('❌ Validação falhou: minutos inválidos');
      setMensagem({ tipo: 'erro', texto: 'Os minutos devem ser entre 00 e 59' });
      return false;
    }

    // Validações específicas para Simulado
    if (formData.tipo === 'Simulado') {
      if (!formData.area) {
        console.error('❌ Validação falhou: área não selecionada');
        setMensagem({ tipo: 'erro', texto: 'Selecione a área do simulado' });
        return false;
      }
      if (!formData.questoes || formData.questoes <= 0) {
        console.error('❌ Validação falhou: questões inválidas');
        setMensagem({ tipo: 'erro', texto: 'Informe o número de questões' });
        return false;
      }
      if (formData.acertos === '' || formData.acertos < 0) {
        console.error('❌ Validação falhou: acertos inválidos');
        setMensagem({ tipo: 'erro', texto: 'Informe o número de acertos' });
        return false;
      }
      if (parseInt(formData.acertos) > parseInt(formData.questoes)) {
        console.error('❌ Validação falhou: acertos maior que questões');
        setMensagem({ tipo: 'erro', texto: 'Acertos não pode ser maior que o total de questões' });
        return false;
      }
    }

    // Validações específicas para Questões
    if (formData.tipo === 'Questões') {
      if (!formData.area) {
        console.error('❌ Validação falhou: área não selecionada');
        setMensagem({ tipo: 'erro', texto: 'Selecione a área das questões' });
        return false;
      }
      if (!formData.materia || !formData.materia.trim()) {
        console.error('❌ Validação falhou: matéria não preenchida');
        setMensagem({ tipo: 'erro', texto: 'Informe a matéria' });
        return false;
      }
      if (!formData.assunto || !formData.assunto.trim()) {
        console.error('❌ Validação falhou: assunto não preenchido');
        setMensagem({ tipo: 'erro', texto: 'Informe o assunto' });
        return false;
      }
      if (!formData.questoes || formData.questoes <= 0) {
        console.error('❌ Validação falhou: questões inválidas');
        setMensagem({ tipo: 'erro', texto: 'Informe o número de questões' });
        return false;
      }
      if (formData.acertos === '' || formData.acertos < 0) {
        console.error('❌ Validação falhou: acertos inválidos');
        setMensagem({ tipo: 'erro', texto: 'Informe o número de acertos' });
        return false;
      }
      if (parseInt(formData.acertos) > parseInt(formData.questoes)) {
        console.error('❌ Validação falhou: acertos maior que questões');
        setMensagem({ tipo: 'erro', texto: 'Acertos não pode ser maior que o total de questões' });
        return false;
      }
    }

    // Validações específicas para Redação
    if (formData.tipo === 'Redação') {
      const competencias = ['c1', 'c2', 'c3', 'c4', 'c5'];
      for (let i = 0; i < competencias.length; i++) {
        const comp = competencias[i];
        const valor = formData[comp];

        if (valor === '') {
          console.error(`❌ Validação falhou: competência ${i + 1} não preenchida`);
          setMensagem({ tipo: 'erro', texto: `Informe a nota da Competência ${i + 1}` });
          return false;
        }

        const valorInt = parseInt(valor);
        if (valorInt < 0 || valorInt > 200) {
          console.error(`❌ Validação falhou: competência ${i + 1} com valor inválido`);
          setMensagem({ tipo: 'erro', texto: `A Competência ${i + 1} deve ser entre 0 e 200` });
          return false;
        }
      }
    }

    console.log('✅ Validação passou!');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 Formulário submetido!');
    console.log('📦 Dados do formulário:', formData);

    setMensagem({ tipo: '', texto: '' });

    if (!validarFormulario()) {
      console.warn('⚠️ Formulário inválido, abortando submit');
      return;
    }

    setIsLoading(true);
    console.log('⏳ Enviando requisição para API...');

    try {
      const url = '/api/criar_atividade';
      console.log('🌐 URL:', url);
      console.log('📤 Payload:', JSON.stringify(formData, null, 2));

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      console.log('📥 Status da resposta:', response.status, response.statusText);

      // Primeiro pegar o texto da resposta
      const responseText = await response.text();
      console.log('📄 Resposta como texto:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('📊 Dados da resposta:', data);
      } catch (parseError) {
        console.error('❌ Erro ao fazer parse do JSON:', parseError);
        console.error('📄 Texto recebido:', responseText);
        throw new Error(`Resposta inválida do servidor: ${responseText.substring(0, 100)}`);
      }

      if (response.ok && data.success) {
        console.log('✅ Sucesso!', data);
        setMensagem({
          tipo: 'sucesso',
          texto: `Atividade criada com sucesso! ID: ${data.id_atividade}`
        });

        // Limpar formulário
        setFormData({
          titulo: '',
          tipo: '',
          dt_inicio: '',
          tempo_total: '',
          comentarios: '',
          area: '',
          materia: '',
          assunto: '',
          questoes: '',
          acertos: '',
          c1: '',
          c2: '',
          c3: '',
          c4: '',
          c5: ''
        });
      } else {
        console.error('❌ Erro na resposta:', data);
        setMensagem({
          tipo: 'erro',
          texto: data.error || 'Erro ao criar atividade'
        });
      }
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      console.error('Stack:', error.stack);
      setMensagem({
        tipo: 'erro',
        texto: `Erro de conexão: ${error.message}`
      });
    } finally {
      setIsLoading(false);
      console.log('✔️ Requisição finalizada');
    }
  };

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="nova-atividade-container">
        {/* Header Fixo */}
        <header className="page-header">
          <button
            className="menu-button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            ☰
          </button>
          <h1 className="page-titulo">Nova Atividade 📝</h1>
        </header>

        {/* Main Content */}
        <main className="page-main">
          <div className="main-content">
            <div className="card">
              <div className="card-header">
                <h2>Registrar Nova Atividade</h2>
              </div>

              <div className="card-body">
                {mensagem.texto && (
                  <div className={`mensagem mensagem-${mensagem.tipo}`}>
                    {mensagem.texto}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="formulario">
          <div className="campo">
            <label htmlFor="titulo">
              Título <span className="obrigatorio">*</span>
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Ex: Simulado ENEM - Matemática"
              disabled={isLoading}
              maxLength={200}
            />
          </div>

          <div className="campo">
            <label htmlFor="tipo">
              Tipo <span className="obrigatorio">*</span>
            </label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="">Selecione o tipo</option>
              {tiposAtividade.map(tipo => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="dt_inicio">
              Data de Início <span className="obrigatorio">*</span>
            </label>
            <input
              type="text"
              id="dt_inicio"
              name="dt_inicio"
              value={formData.dt_inicio}
              onChange={handleChange}
              placeholder="00/00/0000"
              disabled={isLoading}
              maxLength={10}
              inputMode="numeric"
            />
          </div>

          <div className="campo">
            <label htmlFor="tempo_total">
              Tempo Total <span className="obrigatorio">*</span>
            </label>
            <input
              type="text"
              id="tempo_total"
              name="tempo_total"
              value={formData.tempo_total}
              onChange={handleChange}
              placeholder="00:00"
              disabled={isLoading}
              maxLength={5}
              inputMode="numeric"
            />
          </div>

          {/* Campos específicos para Simulado */}
          {formData.tipo === 'Simulado' && (
            <>
              <div className="campo">
                <label htmlFor="area">
                  Área <span className="obrigatorio">*</span>
                </label>
                <select
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="">Selecione a área</option>
                  {areasConhecimento.map(area => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              <div className="campo">
                <label htmlFor="questoes">
                  Questões <span className="obrigatorio">*</span>
                </label>
                <input
                  type="number"
                  id="questoes"
                  name="questoes"
                  value={formData.questoes}
                  onChange={handleChange}
                  placeholder="Total de questões"
                  disabled={isLoading}
                  min="1"
                />
              </div>

              <div className="campo">
                <label htmlFor="acertos">
                  Acertos <span className="obrigatorio">*</span>
                </label>
                <input
                  type="number"
                  id="acertos"
                  name="acertos"
                  value={formData.acertos}
                  onChange={handleChange}
                  placeholder="Questões acertadas"
                  disabled={isLoading}
                  min="0"
                />
              </div>
            </>
          )}

          {/* Campos específicos para Questões */}
          {formData.tipo === 'Questões' && (
            <>
              <div className="campo">
                <label htmlFor="area">
                  Área <span className="obrigatorio">*</span>
                </label>
                <select
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="">Selecione a área</option>
                  {areasConhecimento.map(area => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              <div className="campo">
                <label htmlFor="materia">
                  Matéria <span className="obrigatorio">*</span>
                </label>
                <input
                  type="text"
                  id="materia"
                  name="materia"
                  value={formData.materia}
                  onChange={handleChange}
                  placeholder="Ex: Física, Química, História..."
                  disabled={isLoading}
                  maxLength={100}
                />
              </div>

              <div className="campo">
                <label htmlFor="assunto">
                  Assunto <span className="obrigatorio">*</span>
                </label>
                <input
                  type="text"
                  id="assunto"
                  name="assunto"
                  value={formData.assunto}
                  onChange={handleChange}
                  placeholder="Ex: Cinemática, Termologia, Brasil Colônia..."
                  disabled={isLoading}
                  maxLength={150}
                />
              </div>

              <div className="campo">
                <label htmlFor="questoes">
                  Questões <span className="obrigatorio">*</span>
                </label>
                <input
                  type="number"
                  id="questoes"
                  name="questoes"
                  value={formData.questoes}
                  onChange={handleChange}
                  placeholder="Total de questões"
                  disabled={isLoading}
                  min="1"
                />
              </div>

              <div className="campo">
                <label htmlFor="acertos">
                  Acertos <span className="obrigatorio">*</span>
                </label>
                <input
                  type="number"
                  id="acertos"
                  name="acertos"
                  value={formData.acertos}
                  onChange={handleChange}
                  placeholder="Questões acertadas"
                  disabled={isLoading}
                  min="0"
                />
              </div>
            </>
          )}

          {/* Campos específicos para Redação */}
          {formData.tipo === 'Redação' && (
            <>
              <div className="campo">
                <label htmlFor="c1">
                  Competência 1 <span className="obrigatorio">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  id="c1"
                  name="c1"
                  className="input-sem-setas"
                  value={formData.c1}
                  onChange={handleChange}
                  placeholder="0 - 200"
                  disabled={isLoading}
                  pattern="[0-9]*"
                />
              </div>

              <div className="campo">
                <label htmlFor="c2">
                  Competência 2 <span className="obrigatorio">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  id="c2"
                  name="c2"
                  className="input-sem-setas"
                  value={formData.c2}
                  onChange={handleChange}
                  placeholder="0 - 200"
                  disabled={isLoading}
                  pattern="[0-9]*"
                />
              </div>

              <div className="campo">
                <label htmlFor="c3">
                  Competência 3 <span className="obrigatorio">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  id="c3"
                  name="c3"
                  className="input-sem-setas"
                  value={formData.c3}
                  onChange={handleChange}
                  placeholder="0 - 200"
                  disabled={isLoading}
                  pattern="[0-9]*"
                />
              </div>

              <div className="campo">
                <label htmlFor="c4">
                  Competência 4 <span className="obrigatorio">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  id="c4"
                  name="c4"
                  className="input-sem-setas"
                  value={formData.c4}
                  onChange={handleChange}
                  placeholder="0 - 200"
                  disabled={isLoading}
                  pattern="[0-9]*"
                />
              </div>

              <div className="campo">
                <label htmlFor="c5">
                  Competência 5 <span className="obrigatorio">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  id="c5"
                  name="c5"
                  className="input-sem-setas"
                  value={formData.c5}
                  onChange={handleChange}
                  placeholder="0 - 200"
                  disabled={isLoading}
                  pattern="[0-9]*"
                />
              </div>
            </>
          )}

          <div className="campo">
            <label htmlFor="comentarios">
              Comentários
            </label>
            <textarea
              id="comentarios"
              name="comentarios"
              value={formData.comentarios}
              onChange={handleChange}
              placeholder="Observações opcionais sobre a atividade"
              disabled={isLoading}
              rows={4}
              maxLength={500}
            />
          </div>

          <button
            type="submit"
            className="botao-submit"
            disabled={isLoading}
          >
            {isLoading ? 'Criando...' : 'Criar Atividade'}
          </button>
        </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default NovaAtividade;
