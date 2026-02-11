// =====================================
// Configuração Supabase
// =====================================
const SUPABASE_URL = 'https://ktrsifglbkhntameaqnp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bt0nsjFqqAIa3xBtGtmnDg_aLHCz-Ak';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =====================================
// Login real usando tabela public.usuarios
// =====================================
const loginForm = document.getElementById('login-form');
let usuarioLogado = null;
let tipoUsuario = null;

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const cpf = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;

    const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('cpf', cpf)
        .eq('senha', senha)
        .limit(1);

    if (error) {
        console.error(error);
        alert('Erro ao tentar logar!');
        return;
    }

    if (data.length === 0) {
        alert('CPF ou senha incorretos!');
        return;
    }

    usuarioLogado = data[0].cpf;
    tipoUsuario = data[0].tipo;
    alert(`Bem-vindo, ${usuarioLogado}! Tipo: ${tipoUsuario}`);

    // Mostrar as seções conforme tipo
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('filtro-section').style.display = 'block';
    document.getElementById('tabela-section').style.display = 'block';
    document.getElementById('export-section').style.display = 'block';
    document.getElementById('usuario-master-section').style.display = tipoUsuario === 'master' ? 'block' : 'none';

    carregarRegistros();
    carregarUsuarios();
});

// =====================================
// Carregar registros da tabela public.registros
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
                <button onclick="apagarRegistro(${registro.id}, '${registro.responsavel}', '${registro.vereador_vinculado || ''}')">Apagar</button>
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
    const ano = document.getElementById('ano-registro').value;
    const vereador = prompt("Deseja vincular algum vereador? (CPF, deixe em branco se não)");

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

    alert(`Registro adicionado! Nº do registro: ${data[0].id}`);
    carregarRegistros();
});

// =====================================
// Apagar registro
// =====================================
async function apagarRegistro(id, responsavel, vereador) {
    // Usuário só pode apagar se for ele mesmo ou vinculado
    if (usuarioLogado !== responsavel && usuarioLogado !== vereador && tipoUsuario !== 'master') {
        alert('Você não tem permissão para apagar este registro!');
        return;
    }

    const confirmacao = confirm(`Deseja realmente apagar o registro Nº ${id}?`);
    if (!confirmacao) return;

    const { error } = await supabase
        .from('registros')
        .delete()
        .eq('id', id);

    if (error) {
        console.error(error);
        alert('Erro ao apagar registro!');
        return;
    }

    alert(`Registro Nº ${id} apagado!`);
    carregarRegistros();
}

// =====================================
// Carregar usuários (somente MASTER)
 // =====================================
function carregarUsuarios() {
    if (tipoUsuario !== 'master') return;

    supabase
        .from('usuarios')
        .select('*')
        .then(({ data, error }) => {
            if (error) {
                console.error(error);
                return;
            }

            const tbody = document.querySelector('#tabela-usuarios tbody');
            tbody.innerHTML = '';
            data.forEach(u => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${u.cpf}</td>
                    <td>${u.senha}</td>
                    <td>${u.tipo}</td>
                    <td>
                        <button onclick="resetSenha('${u.cpf}')">Resetar</button>
                        <button onclick="inativarUsuario('${u.cpf}')">Inativar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        });
}

// =====================================
// Resetar senha MASTER (simulado)
// =====================================
function resetSenha(cpf) {
    const novaSenha = prompt(`Nova senha para ${cpf}:`);
    if (!novaSenha) return;

    supabase
        .from('usuarios')
        .update({ senha: novaSenha })
        .eq('cpf', cpf)
        .then(({ error }) => {
            if (error) {
                alert('Erro ao resetar senha');
                console.error(error);
            } else {
                alert(`Senha de ${cpf} alterada!`);
                carregarUsuarios();
            }
        });
}

// =====================================
// Inativar usuário MASTER (simulado)
// =====================================
function inativarUsuario(cpf) {
    const confirmacao = confirm(`Deseja inativar ${cpf}?`);
    if (!confirmacao) return;

    supabase
        .from('usuarios')
        .delete()
        .eq('cpf', cpf)
        .then(({ error }) => {
            if (error) {
                alert('Erro ao inativar usuário');
                console.error(error);
            } else {
                alert(`${cpf} inativado!`);
                carregarUsuarios();
            }
        });
}

// =====================================
// Exportar registros (simulação)
// =====================================
document.getElementById('export-btn').addEventListener('click', () => {
    const formato = document.getElementById('export-format').value;
    alert(`Exportando registros em ${formato.toUpperCase()} (funcionalidade ainda precisa ser implementada)`);
});
