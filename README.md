# 🧠 IA Context Menu - Reescritor de Textos

Uma extensão do Chrome que adiciona opções de IA ao menu de contexto (botão direito) para reescrever, corrigir e resumir textos usando a API da OpenAI.

## ✨ Funcionalidades

### Opções de IA
- **🧠 Reescrever com IA** - Reescreve o texto selecionado de forma clara e profissional
- **✏️ Corrigir Gramática** - Corrige erros gramaticais e ortográficos
- **📝 Resumir Texto** - Cria um resumo conciso do texto selecionado
- **📧 Tornar Formal** - Transforma em linguagem formal para negócios
- **😊 Tornar Informal** - Deixa o texto mais casual e amigável
- **🎯 Criar Bullet Points** - Organiza o conteúdo em tópicos
- **🔍 Expandir Texto** - Adiciona mais detalhes e explicações
- **✂️ Reduzir 50%** - Corta pela metade mantendo o essencial
- **🌐 Traduções** - Inglês, Espanhol e Português

### Recursos Extras
- **👓 Modal de Visualização** - Veja o resultado antes de copiar, com comparação lado a lado
- **⚡ Atalhos de Teclado** - `Cmd+Shift+R` para reescrever, `Cmd+Shift+G` para gramática
- **🪄 Prompt Personalizado** - Use seus próprios prompts para processar textos
- **📜 Histórico Completo** - Mantenha um registro de todas as transformações
- **💾 Prompts Salvos** - Salve e reutilize seus prompts favoritos
- **📋 Sistema de Snippets** - Crie, salve e reutilize textos frequentes
- **🌓 Tema Claro/Escuro** - Escolha o tema que melhor se adapta a você
- **📊 Estatísticas de Uso** - Acompanhe quantas vezes você usa a extensão
- **🎨 Animações Suaves** - Interface moderna com feedback visual
- **🎉 Onboarding** - Tutorial interativo para novos usuários

## 🚀 Instalação

### 1. Preparar os arquivos

1. Baixe todos os arquivos desta pasta
2. Abra o arquivo `generate-icons.html` no navegador
3. Clique com o botão direito em cada ícone e salve com os nomes:
   - `icon-16.png`
   - `icon-48.png`
   - `icon-128.png`

### 2. Instalar no Chrome

1. Abra o Chrome e acesse `chrome://extensions/`
2. Ative o **Modo do desenvolvedor** (canto superior direito)
3. Clique em **Carregar sem compactação**
4. Selecione a pasta com todos os arquivos da extensão
5. A extensão aparecerá na barra de ferramentas

### 3. Configurar a extensão

1. Clique no ícone da extensão na barra de ferramentas
2. Na aba **⚙️ Configuração**, insira sua chave da API OpenAI
3. Escolha o modelo desejado (GPT-3.5 ou GPT-4)
4. Clique em **💾 Salvar Configurações**

> **Nota:** Você precisa de uma chave da API OpenAI. [Obtenha uma aqui](https://platform.openai.com/api-keys)

## 📖 Como usar

### Uso básico

1. Selecione qualquer texto em uma página web
2. Clique com o botão direito
3. Escolha uma das opções no menu "🧠 IA Context Menu":
   - 🧠 Reescrever com IA
   - ✏️ Corrigir Gramática
   - 📝 Resumir Texto
   - 📧 Tornar Formal
   - 😊 Tornar Informal
   - 🎯 Criar Bullet Points
   - 🔍 Expandir Texto
   - ✂️ Reduzir 50%
   - 🌐 Traduzir para...
   - 🪄 Prompt Personalizado

4. O popup da extensão se abrirá mostrando o resultado
5. Compare o texto original com o texto transformado
6. Clique em **📋 Copiar Resultado** para copiar para a área de transferência

### Prompts personalizados

1. Selecione um texto e clique em **🪄 Prompt Personalizado**
2. A extensão abrirá automaticamente
3. Digite seu prompt (ex: "Traduza para inglês")
4. Clique em **🚀 Executar Prompt**

### Gerenciar histórico

- Acesse a aba **📜 Histórico** para ver transformações anteriores
- Clique em qualquer item para ver o texto completo original e transformado
- Use **📋 Copiar** para reutilizar resultados
- Use **🗑️ Limpar Histórico** para remover todos os itens

## ⚙️ Estrutura dos arquivos

```
ia-context-menu/
├── manifest.json      # Configuração da extensão
├── background.js      # Lógica do menu de contexto
├── popup.html         # Interface do popup
├── popup.js           # Lógica do popup
├── styles.css         # Estilos visuais
├── generate-icons.html # Gerador de ícones
├── icon-16.png        # Ícone 16x16
├── icon-48.png        # Ícone 48x48
├── icon-128.png       # Ícone 128x128
├── CHANGELOG.md       # Histórico de versões
└── README.md          # Este arquivo
```

## 🔒 Segurança

- Sua chave da API é armazenada localmente no navegador
- Nunca é enviada para servidores terceiros
- Todo o processamento é feito diretamente com a API da OpenAI

## 🐛 Solução de problemas

### A extensão não aparece no menu de contexto
- Verifique se a extensão está ativada em `chrome://extensions/`
- Recarregue a página onde está tentando usar

### Erro "Chave da API não configurada"
- Clique no ícone da extensão
- Insira sua chave da API na aba Configuração
- Salve as configurações

### Erro na API
- Verifique se sua chave da API está correta
- Confirme se tem créditos na sua conta OpenAI
- Tente um modelo diferente (GPT-3.5 se estiver usando GPT-4)

## 📊 Modelos disponíveis

- **GPT-3.5 Turbo** - Rápido e econômico, ideal para a maioria dos casos
- **GPT-4** - Mais inteligente, melhor para textos complexos
- **GPT-4 Turbo** - Recomendado: combina velocidade e inteligência

## 💡 Dicas de uso

1. **Para emails**: Use "Tornar Formal" para comunicações profissionais
2. **Para estudos**: Use "Resumir Texto" ou "Bullet Points" em artigos longos
3. **Para idiomas**: Use as opções de tradução ou crie um prompt personalizado
4. **Para revisão**: Veja a comparação lado a lado antes de copiar o resultado

## 🤝 Contribuições

Sinta-se à vontade para melhorar esta extensão! Algumas ideias:

- Adicionar mais opções predefinidas no menu
- Suporte para outros modelos de IA
- Integração com outros serviços além da OpenAI
- Atalhos de teclado personalizáveis

## 📄 Licença

Este projeto é de código aberto e está disponível para uso e modificação livre.

---

**Desenvolvido com 💜 para facilitar sua escrita com IA** 