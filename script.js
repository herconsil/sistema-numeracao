// =====================================
// Configuração Supabase
// =====================================
const SUPABASE_URL = 'https://ktrsifglbkhntameaqnp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0cnNpZmdsYmtobnRhbWVhcW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NjQ4NDksImV4cCI6MjA4NjM0MDg0OX0.zVNL4YNvt_rOxGBawQKK-ibWsxi4_NabCLVZ_GNOBWw';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =====================================
// Função para carregar registros
// =====================================
async function carregarRegistros() {
    const { data, error } = await supabase
        .from('registros_simples')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error('Erro ao carregar registros:', error);
        return;
    }

    const tbody = document.querySelector('#tabela tbody');
    tbody.innerHTML = '';

    data.forEach(registro => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${registro.id}</td>
            <td>${registro.tipo_registro}</td>
            <td>${new Date(registro.data_hora).toLocaleString()}</td>
        `;
        tbody.appendChild(tr);
    });
}

// =====================================
// Adicionar registro simples
// =====================================
document.getElementById('addRegistro').addEventListener('click', async () => {
    const tipo = document.getElementById('tipo').value;
    if (!tipo) {
        alert('Digite o tipo de registro');
        return;
    }

    const { data, error } = await supabase
        .from('registros_simples')
        .insert([{
            tipo_registro: tipo,
            data_hora: new Date().toISOString()
        }]);

    if (error) {
        console.error('Erro ao adicionar registro:', error);
        alert('Erro ao adicionar registro!');
        return;
    }

    alert(`Registro adicionado! ID: ${data[0].id}`);
    document.getElementById('tipo').value = '';
    carregarRegistros();
});

// =====================================
// Carregar registros ao abrir a página
// =====================================
carregarRegistros();
