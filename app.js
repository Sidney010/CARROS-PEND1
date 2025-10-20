'use strict'

const tipoVeiculoSelect = document.getElementById("tipo-veiculo")
const marcasSelect = document.getElementById("marcas")
const modelosSelect = document.getElementById("modelos")
const anosSelect = document.getElementById("ano")
const botaoBuscar = document.getElementById("buscar-fipe")
const imagemVeiculo = document.getElementById("imagem-veiculo")
const mensagemImagem = document.getElementById("mensagem-imagem")

const resultadoDivs = document.querySelectorAll(".container-tabela-fipe-botton-right-div")

const API_FIPE = "https://parallelum.com.br/fipe/api/v1"
const API_IMAGE = "https://api.auto-data.net/image-database" // URL base Auto-Data

function limparSelect(select, textoPadrao) {
    select.innerHTML = `<option value="">${textoPadrao}</option>`
}

// ---------------- FIPE ----------------
tipoVeiculoSelect.addEventListener("change", async () => {
    const tipo = tipoVeiculoSelect.value
    limparSelect(marcasSelect, "Marcas Disponíveis")
    limparSelect(modelosSelect, "Escolha o modelo")
    limparSelect(anosSelect, "Escolha o ano")

    if (!tipo) return

    try {
        const response = await fetch(`${API_FIPE}/${tipo}/marcas`)
        const marcas = await response.json()
        marcas.forEach(marca => {
            const option = document.createElement("option")
            option.value = marca.codigo
            option.textContent = marca.nome
            marcasSelect.appendChild(option)
        })
    } catch (erro) {
        console.error("Erro ao carregar marcas:", erro)
    }
})

marcasSelect.addEventListener("change", async () => {
    const tipo = tipoVeiculoSelect.value
    const marcaNome = marcasSelect.options[marcasSelect.selectedIndex].text
    const marcaCodigo = marcasSelect.value

    limparSelect(modelosSelect, "Escolha o modelo")
    limparSelect(anosSelect, "Escolha o ano")

    if (!marcaCodigo) return

    try {
        const response = await fetch(`${API_FIPE}/${tipo}/marcas/${marcaCodigo}/modelos`)
        const data = await response.json()

        data.modelos.forEach(modelo => {
            const option = document.createElement("option")
            option.value = modelo.codigo
            option.textContent = modelo.nome
            modelosSelect.appendChild(option)
        })

        // Atualiza imagem da marca
        atualizarImagem(marcaNome)
    } catch (erro) {
        console.error("Erro ao carregar modelos:", erro)
    }
})

modelosSelect.addEventListener("change", async () => {
    const tipo = tipoVeiculoSelect.value
    const marcaNome = marcasSelect.options[marcasSelect.selectedIndex].text
    const marcaCodigo = marcasSelect.value
    const modeloNome = modelosSelect.options[modelosSelect.selectedIndex].text
    limparSelect(anosSelect, "Escolha o ano")

    if (!modeloNome) return

    try {
        const response = await fetch(`${API_FIPE}/${tipo}/marcas/${marcaCodigo}/modelos/${modelosSelect.value}/anos`)
        const anos = await response.json()
        anos.forEach(ano => {
            const option = document.createElement("option")
            option.value = ano.codigo
            option.textContent = ano.nome
            anosSelect.appendChild(option)
        })

        atualizarImagem(`${marcaNome} ${modeloNome}`)
    } catch (erro) {
        console.error("Erro ao carregar anos:", erro)
    }
})

botaoBuscar.addEventListener("click", async (e) => {
    e.preventDefault()

    const tipo = tipoVeiculoSelect.value
    const marca = marcasSelect.value
    const modelo = modelosSelect.value
    const ano = anosSelect.value

    if (!tipo || !marca || !modelo || !ano) {
        alert("Por favor, selecione todos os campos antes de buscar!")
        return
    }

    try {
        const response = await fetch(`${API_FIPE}/${tipo}/marcas/${marca}/modelos/${modelo}/anos/${ano}`)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const veiculo = await response.json()

        resultadoDivs[0].textContent = veiculo.Valor || "Valor não disponível"
        resultadoDivs[1].textContent = `${veiculo.Marca} / ${veiculo.Modelo}`
        resultadoDivs[2].textContent = `${veiculo.AnoModelo} / ${veiculo.Combustivel}`
        resultadoDivs[3].textContent = veiculo.CodigoFipe
        resultadoDivs[4].textContent = veiculo.MesReferencia
    } catch (erro) {
        console.error("Erro ao buscar dados FIPE:", erro)
        alert("Erro ao buscar dados. Verifique o console.")
    }
})

// ---------------- Imagens ----------------
async function atualizarImagem(nomeCompleto) {
    const [marca, modelo] = nomeCompleto.split(' ')
    const imagemPadrao = './img/default-car.png'

    if (!marca) {
        imagemVeiculo.src = imagemPadrao
        mensagemImagem.textContent = "Nenhuma imagem disponível."
        return
    }

    try {
        const response = await fetch(`${API_IMAGE}?brand=${marca}&model=${modelo || ''}`)
        const dados = await response.json()

        if (dados && dados.length > 0) {
            // Usa primeira imagem disponível
            imagemVeiculo.src = dados[0].image
            mensagemImagem.textContent = ""
        } else {
            // Sem imagem específica
            imagemVeiculo.src = imagemPadrao
            mensagemImagem.textContent = modelo ? `Não há imagens deste carro no momento. Exibindo ${marca} genérico.` : "Não há imagens deste carro no momento."
        }
    } catch (erro) {
        console.error("Erro ao buscar imagem:", erro)
        imagemVeiculo.src = imagemPadrao
        mensagemImagem.textContent = "Erro ao carregar imagem."
    }
}
