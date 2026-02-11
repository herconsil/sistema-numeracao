// =====================================
// Supabase Config
// =====================================
const SUPABASE_URL = 'https://seusupabaseurl.supabase.co';
const SUPABASE_ANON_KEY = 'sua_chave_publica';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =====================================
// Login
// =====================================
const loginForm = document.getElementById('login-form');
let usuarioLogado = null;

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;

    const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('cpf', usuario)
        .eq('senha', senha)
        .single();

    if (error || !data) {
        alert('CPF ou senha incorretos!');
        return;
    }

    usuarioLogado = usuario;
    alert(`Bem-vindo, ${usuario}!`);

    document.getElementById('login-section').style.display = 'none';
    document.getElementById('filtro-section').style.display = 'block';
    document.getElementById('tabela-section').style.display = 'block';
    document.getElementById('export-section').style.display = 'block';
    if(data.tipo === 'master') {
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

    if (error) {
        console.error(error);
        return;
    }

    const tbody = document.querySelector('#tabela-registros tbody');
    tbody.innerHTML = '';
    data.forEach(registro => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${registro.tipo_registro}</td>
            <td>${registro.id}</td>
            <td>${new Date(registro.data_hora).toLocaleString()}</td>
            <td>${registro.responsavel}</td>
            <td>${registro.vereador_vinculado || '-'}</td>
            <td>
                <button onclick="apagarRegistro('${registro.id}', '${registro.responsavel}', '${registro.vereador_vinculado || ''}')">Apagar</button>
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
    const vereador = prompt("CPF do vereador vinculado (opcional):");

    const { data, error } = await supabase
        .from('registros')
        .insert([{
            tipo_registro: tipo,
            data_hora: new Date().toISOString(),
            responsavel: usuarioLogado,
            vereador_vinculado: vereador || null
        }]);

    if (error) {
        console.error(error);
        alert('Erro ao adicionar registro!');
        return;
    }

    alert(`Registro adicionado! Nº: ${data[0].id}`);
    carregarRegistros();
});

// =====================================
// Apagar registro
// =====================================
async function apagarRegistro(id, responsavel, vereador) {
    if(usuarioLogado !== responsavel && usuarioLogado !== vereador) {
        alert('Você não tem permissão!');
        return;
    }

    const confirmacao = confirm(`Deseja apagar registro Nº ${id}?`);
    if(!confirmacao) return;

    const { error } = await supabase
        .from('registros')
        .delete()
        .eq('id', id);

    if(error){
        console.error(error);
        alert('Erro ao apagar registro!');
        return;
    }

    alert(`Registro Nº ${id} apagado!`);
    carregarRegistros();
}

// =====================================
// Exportação simulada
// =====================================
document.getElementById('export-btn').addEventListener('click', () => {
    const formato = document.getElementById('export-format').value;
    alert(`Exportando registros em ${formato.toUpperCase()} (implementação real pode ser adicionada)`);
});

// =====================================
// Carregar usuários (MASTER)
function carregarUsuarios() {
    const tbody = document.querySelector('#tabela-usuarios tbody');
    tbody.innerHTML = '';
    supabase.from('usuarios').select('*').then(({data,error})=>{
        if(error){console.error(error); return;}
        data.forEach(u=>{
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${u.cpf}</td>
                <td>${u.tipo}</td>
                <td>
                    <button>Resetar Senha</button>
                    <button>Inativar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    });
}
