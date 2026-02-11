// =====================================
// Configuração Supabase
// =====================================
const SUPABASE_URL = 'https://ktrsifglbkhntameaqnp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bt0nsjFqqAIa3xBtGtmnDg_aLHCz-Ak';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =====================================
// Login Simples
// =====================================
const loginForm = document.getElementById('login-form');
let usuarioLogado = null;
let tipoUsuario = null;

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;

    // Para teste inicial: MASTER fixo
    if (usuario === 'herconsil' && senha === '@Nicolly211293') {
        usuarioLogado = usuario;
        tipoUsuario = 'master';
        alert('Bem-vindo MASTER!');
    } else {
        usuarioLogado = usuario;
        tipoUsuario = 'normal'; // normal ou vereador
        alert(`Bem-vindo, ${usuario}!`);
    }

    // Mostra as seções
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('filtro-section').style.display = 'block';
    document.getElementById('tabela-section').style.display = 'block';
    document.getElementById('export-section').style.display = 'block';
    if(tipoUsuario === 'master') {
        document.getElementById('usuario-master-section').style.display = 'block';
    }

    carregarRegistros();
    carregarUsuarios();
});

// =====================================
// Carregar registros
// =====================================
async function carregarRegistros() {
    const { data, error } = await supabase
        .from('registros')
        .select('*')
        .order('id', { ascending: true });

    if(error) { console.error(error); return; }

    const tbody = document.querySelector('#tabela-registros tbody');
    tbody.innerHTML = '';

    data.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.tipo_registro}</td>
            <td>${r.id}</td>
            <td>${new Date(r.data_hora).toLocaleString()}</td>
            <td>${r.responsavel}</td>
            <td>${r.vereador_vinculado || '-'}</td>
            <td>
                <button onclick="apagarRegistro(${r.id}, '${r.responsavel}', '${r.vereador_vinculado || ''}')">Apagar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// =====================================
// Adicionar registro
// =====================================
document.getElementById('adicionar-registro').addEventListener('click', async () => {
    const tipo = document.getElementById('tipo-registro').value;
    const vereador = prompt("Deseja vincular algum vereador? (Deixe em branco se não)");

    const { data, error } = await supabase
        .from('registros')
        .insert([{
            tipo_registro: tipo,
            data_hora: new Date().toISOString(),
            responsavel: usuarioLogado,
            vereador_vinculado: vereador || null
        }]);

    if(error) { console.error(error); alert('Erro ao adicionar registro!'); return; }

    alert(`Registro adicionado! Nº do registro: ${data[0].id}`);
    carregarRegistros();
});

// =====================================
// Apagar registro
// =====================================
async function apagarRegistro(id, responsavel, vereador) {
    if(usuarioLogado !== responsavel && usuarioLogado !== vereador && tipoUsuario !== 'master') {
        alert('Você não tem permissão para apagar este registro!');
        return;
    }

    const confirmacao = confirm(`Deseja realmente apagar o registro Nº ${id}?`);
    if(!confirmacao) return;

    const { error } = await supabase
        .from('registros')
        .delete()
        .eq('id', id);

    if(error) { console.error(error); alert('Erro ao apagar registro!'); return; }

    alert(`Registro Nº ${id} apagado!`);
    carregarRegistros();
}

// =====================================
// Carregar usuários (simulado)
// =====================================
function carregarUsuarios() {
    const usuarios = [
        { nome: 'Hércules', login: 'herconsil', tipo: 'master' },
        { nome: 'João Silva', login: 'joao123', tipo: 'normal' },
        { nome: 'Vereador R', login: 'vereador1', tipo: 'vereador' }
    ];

    const tbody = document.querySelector('#tabela-usuarios tbody');
    tbody.innerHTML = '';
    usuarios.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${u.nome}</td>
            <td>${u.login}</td>
            <td>${u.tipo}</td>
            <td>
                <button>Editar</button>
                <button>Resetar Senha</button>
                <button>Inativar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// =====================================
// Exportar registros (simulação)
// =====================================
document.getElementById('export-btn').addEventListener('click', () => {
    const formato = document.getElementById('export-format').value;
    alert(`Exportando registros em ${formato.toUpperCase()} (simulação)`);
});
