'use strict'

const tipoVeiculoSelect = document.getElementById("tipo-veiculo")
const marcasSelect = document.getElementById("marcas")
const modelosSelect = document.getElementById("modelos")
const anosSelect = document.getElementById("ano")
const botaoBuscar = document.getElementById("buscar-fipe")
const imagemVeiculo = document.getElementById("imagem-veiculo")

// Cria um elemento de mensagem que aparecerá quando não houver imagem
const mensagemImagem = document.createElement("p")
mensagemImagem.id = "mensagem-imagem"
mensagemImagem.style.textAlign = "center"
mensagemImagem.style.fontSize = "14px"
mensagemImagem.style.color = "#ccc"
mensagemImagem.style.marginTop = "10px"
imagemVeiculo.parentElement.appendChild(mensagemImagem)

// Elementos onde serão exibidos os resultados
const resultadoDivs = document.querySelectorAll(".container-tabela-fipe-botton-right-div")

// URL base da API FIPE
const API_BASE = "https://parallelum.com.br/fipe/api/v1"

// Função para limpar selects
function limparSelect(select, textoPadrao) {
    select.innerHTML = `<option value="">${textoPadrao}</option>`
}

// Quando o tipo de veículo é selecionado
tipoVeiculoSelect.addEventListener("change", async () => {
    const tipo = tipoVeiculoSelect.value
    limparSelect(marcasSelect, "Marcas Disponíveis")
    limparSelect(modelosSelect, "Escolha o modelo")
    limparSelect(anosSelect, "Escolha o ano")

    if (!tipo) return

    try {
        const response = await fetch(`${API_BASE}/${tipo}/marcas`)
        const marcas = await response.json()

        marcas.forEach(marca => {
            const option = document.createElement("option")
            option.value = marca.codigo
            option.textContent = marca.nome
            marcasSelect.appendChild(option)
        })
    } catch (error) {
        console.error("Erro ao carregar marcas:", error)
    }
})

// Quando a marca é selecionada
marcasSelect.addEventListener("change", async () => {
    const tipo = tipoVeiculoSelect.value
    const marcaNome = marcasSelect.options[marcasSelect.selectedIndex].text
    const marcaCodigo = marcasSelect.value

    limparSelect(modelosSelect, "Escolha o modelo")
    limparSelect(anosSelect, "Escolha o ano")

    if (!marcaCodigo) return

    try {
        const response = await fetch(`${API_BASE}/${tipo}/marcas/${marcaCodigo}/modelos`)
        const data = await response.json()

        data.modelos.forEach(modelo => {
            const option = document.createElement("option")
            option.value = modelo.codigo
            option.textContent = modelo.nome
            modelosSelect.appendChild(option)
        })

        // Atualiza imagem com base na marca
        atualizarImagem(marcaNome)
    } catch (error) {
        console.error("Erro ao carregar modelos:", error)
    }
})

// Quando o modelo é selecionado
modelosSelect.addEventListener("change", async () => {
    const tipo = tipoVeiculoSelect.value
    const marcaNome = marcasSelect.options[marcasSelect.selectedIndex].text
    const marcaCodigo = marcasSelect.value
    const modeloNome = modelosSelect.options[modelosSelect.selectedIndex].text
    limparSelect(anosSelect, "Escolha o ano")

    if (!modeloNome) return

    try {
        const response = await fetch(`${API_BASE}/${tipo}/marcas/${marcaCodigo}/modelos/${modelosSelect.value}/anos`)
        const anos = await response.json()

        anos.forEach(ano => {
            const option = document.createElement("option")
            option.value = ano.codigo
            option.textContent = ano.nome
            anosSelect.appendChild(option)
        })

        // Atualiza imagem com base no modelo completo
        atualizarImagem(`${marcaNome} ${modeloNome}`)
    } catch (error) {
        console.error("Erro ao carregar anos:", error)
    }
})

// Botão buscar
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
        const response = await fetch(`${API_BASE}/${tipo}/marcas/${marca}/modelos/${modelo}/anos/${ano}`)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const veiculo = await response.json()

        resultadoDivs[0].textContent = veiculo.Valor || "Valor não disponível"
        resultadoDivs[1].textContent = `${veiculo.Marca} / ${veiculo.Modelo}`
        resultadoDivs[2].textContent = `${veiculo.AnoModelo} / ${veiculo.Combustivel}`
        resultadoDivs[3].textContent = veiculo.CodigoFipe
        resultadoDivs[4].textContent = veiculo.MesReferencia

    } catch (error) {
        console.error("Erro ao buscar dados FIPE:", error)
        alert("Erro ao buscar dados. Verifique o console.")
    }
})

function atualizarImagem(nome) {
    const marca = marcasSelect.options[marcasSelect.selectedIndex]?.text || ''
    const nomeFormatado = nome.toLowerCase().replace(/\s+/g, '-')
    const marcaFormatada = marca.toLowerCase().replace(/\s+/g, '-')

    const imagemModelo = `./img/${nomeFormatado}.png`
    const imagemMarca = `./img/${marcaFormatada}.png`
    const imagemPadrao = `./img/default-car.png`

    const img = new Image()

    img.src = imagemModelo
    img.onload = () => {
        imagemVeiculo.src = imagemModelo
        mensagemImagem.textContent = ""
    }

    img.onerror = () => {
        // Tenta imagem da marca
        const imgMarca = new Image()
        imgMarca.src = imagemMarca
        imgMarca.onload = () => {
            imagemVeiculo.src = imagemMarca
            mensagemImagem.textContent = `Não há imagens deste carro no momento, porém o mais semelhante é um modelo da ${marca}.`
        }

        imgMarca.onerror = () => {
            imagemVeiculo.src = imagemPadrao
            mensagemImagem.textContent = "Não há imagens deste carro no momento, e nenhum modelo semelhante foi encontrado."
        }
    }
}