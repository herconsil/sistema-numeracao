// =====================================
// Configuração Supabase
// =====================================
const SUPABASE_URL = 'https://SEU-SUPABASE-URL';
const SUPABASE_ANON_KEY = 'SUA-CHAVE-ANON';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let usuarioLogado = null;
let tipoUsuario = null;

// =====================================
// Login
// =====================================
document.getElementById('login-form').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const cpf = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;

    const { data: user, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('cpf', cpf)
        .eq('senha', senha)
        .single();

    if(error || !user){
        alert('CPF ou senha incorretos!');
        return;
    }

    usuarioLogado = cpf;
    tipoUsuario = user.tipo;

    alert(`Bem-vindo, ${usuarioLogado}! Tipo: ${tipoUsuario}`);

    document.getElementById('login-section').style.display = 'none';
    document.getElementById('filtro-section').style.display = 'block';
    document.getElementById('tabela-section').style.display = 'block';
    document.getElementById('export-section').style.display = 'block';
    if(tipoUsuario==='master') document.getElementById('usuario-master-section').style.display='block';

    carregarRegistros();
    if(tipoUsuario==='master') carregarUsuarios();
});

// =====================================
// Carregar registros
// =====================================
async function carregarRegistros(){
    const { data, error } = await supabase
        .from('registros')
        .select('*')
        .order('id',{ascending:true});

    if(error) { console.error(error); return; }

    const tbody = document.querySelector('#tabela-registros tbody');
    tbody.innerHTML='';

    data.forEach(reg=>{
        const tr=document.createElement('tr');
        tr.innerHTML=`
            <td>${reg.tipo_registro}</td>
            <td>${reg.id}</td>
            <td>${new Date(reg.data_hora).toLocaleString()}</td>
            <td>${reg.responsavel}</td>
            <td>${reg.vereador_vinculado || '-'}</td>
            <td><button onclick="apagarRegistro('${reg.id}','${reg.responsavel}','${reg.vereador_vinculado||''}')">Apagar</button></td>
        `;
        tbody.appendChild(tr);
    });
}

// =====================================
// Adicionar registro
// =====================================
document.getElementById('adicionar-registro').addEventListener('click', async ()=>{
    const tipo = document.getElementById('tipo-registro').value;
    const vereador = prompt("CPF do vereador (opcional):");

    const { data, error } = await supabase
        .from('registros')
        .insert([{tipo_registro:tipo, data_hora:new Date().toISOString(), responsavel:usuarioLogado, vereador_vinculado:vereador || null}]);

    if(error){ console.error(error); alert('Erro ao adicionar registro!'); return; }

    alert(`Registro adicionado! Nº: ${data[0].id}`);
    carregarRegistros();
});

// =====================================
// Apagar registro
// =====================================
async function apagarRegistro(id, responsavel, vereador){
    if(usuarioLogado!==responsavel && usuarioLogado!==vereador && tipoUsuario!=='master'){
        alert('Você não tem permissão!');
        return;
    }
    if(!confirm(`Deseja apagar registro Nº ${id}?`)) return;

    const { error } = await supabase.from('registros').delete().eq('id',id);
    if(error){ console.error(error); alert('Erro ao apagar registro!'); return; }

    alert(`Registro Nº ${id} apagado!`);
    carregarRegistros();
}

// =====================================
// Carregar usuários (master)
function carregarUsuarios(){
    const tbody=document.querySelector('#tabela-usuarios tbody');
    tbody.innerHTML='';

    supabase.from('usuarios').select('*').then(({data,error})=>{
        if(error) return console.error(error);
        data.forEach(u=>{
            const tr=document.createElement('tr');
            tr.innerHTML=`
                <td>${u.cpf}</td>
                <td>${u.tipo}</td>
                <td>
                    <button onclick="resetSenha('${u.cpf}')">Resetar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    });
}

// =====================================
// Exportar (simulação)
document.getElementById('export-btn').addEventListener('click',()=>{
    const formato = document.getElementById('export-format').value;
    alert(`Exportando em ${formato.toUpperCase()} (simulação)`);
});
