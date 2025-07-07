// Elementos DOM
const elements = {
  apiKey: document.getElementById('apiKey'),
  model: document.getElementById('model'),
  saveConfig: document.getElementById('saveConfig'),
  toggleKey: document.getElementById('toggleKey'),
  tabs: document.querySelectorAll('.tab'),
  tabContents: document.querySelectorAll('.tab-content'),
  message: document.getElementById('message'),
  totalUses: document.getElementById('totalUses'),
  todayUses: document.getElementById('todayUses'),
  customPrompt: document.getElementById('customPrompt'),
  executeCustom: document.getElementById('executeCustom'),
  selectedTextPreview: document.getElementById('selectedTextPreview'),
  selectedTextContent: document.getElementById('selectedTextContent'),
  historyList: document.getElementById('historyList'),
  clearHistory: document.getElementById('clearHistory'),
  savedPromptsList: document.getElementById('savedPromptsList'),
  savePrompt: document.getElementById('savePrompt'),
  
  // Modal de resultado
  resultModal: document.getElementById('result-modal'),
  closeModal: document.getElementById('close-modal'),
  resultModalTitle: document.getElementById('result-modal-title'),
  originalText: document.getElementById('original-text'),
  transformedText: document.getElementById('transformed-text'),
  copyResult: document.getElementById('copy-result'),
  applyReplace: document.getElementById('apply-replace'),
  saveToHistory: document.getElementById('save-to-history'),
  
  // Novos elementos para visualização
  viewContainer: document.getElementById('result-view-container'),
  diffView: document.getElementById('result-diff-view'),
  diffContent: document.getElementById('diff-content'),
  viewButtons: document.querySelectorAll('.btn-view'),
  
  // Formatação
  toggleWordWrap: document.getElementById('toggle-word-wrap'),
  increaseFont: document.getElementById('increase-font'),
  decreaseFont: document.getElementById('decrease-font')
};

// Ações com rótulos para uso global
const actionLabels = {
  'rewrite-text': '🧠 Reescrito',
  'fix-grammar': '✏️ Gramática corrigida',
  'summarize': '📝 Resumido',
  'make-formal': '📧 Formalizado',
  'make-informal': '😊 Informalizado',
  'bullet-points': '🎯 Bullet points',
  'expand-text': '🔍 Expandido',
  'reduce-text': '✂️ Reduzido',
  'translate-en': '🇺🇸 Traduzido (EN)',
  'translate-es': '🇪🇸 Traduzido (ES)',
  'translate-pt': '🇧🇷 Traduzido (PT)',
  'custom-prompt': '🪄 Prompt custom',
  'manual-save': '💾 Salvo manualmente'
};

// Títulos completos para o modal de resultados
const modalTitles = {
  'rewrite-text': '🧠 Texto Reescrito',
  'fix-grammar': '✏️ Gramática Corrigida',
  'summarize': '📝 Resumo do Texto',
  'make-formal': '📧 Texto Formalizado',
  'make-informal': '😊 Texto Informal',
  'bullet-points': '🎯 Bullet Points',
  'expand-text': '🔍 Texto Expandido',
  'reduce-text': '✂️ Texto Reduzido',
  'translate-en': '🇺🇸 Tradução para Inglês',
  'translate-es': '🇪🇸 Tradução para Espanhol', 
  'translate-pt': '🇧🇷 Tradução para Português',
  'custom-prompt': '🪄 Prompt Personalizado',
  'manual-save': '💾 Salvo Manualmente'
};

// Inicializar
document.addEventListener('DOMContentLoaded', async () => {
  // Verificar se é a primeira vez
  const { hasSeenWelcome } = await chrome.storage.local.get(['hasSeenWelcome']);
  
  if (!hasSeenWelcome) {
    document.getElementById('welcome-screen').style.display = 'flex';
    
    document.getElementById('start-setup').addEventListener('click', async () => {
      document.getElementById('welcome-screen').style.display = 'none';
      await chrome.storage.local.set({ hasSeenWelcome: true });
      
      // Focar no campo de API key
      elements.apiKey.focus();
    });
  }
  
  // Configurar o modal de resultado
  setupResultModal();
  
  await loadConfig();
  await loadStats();
  await loadHistory();
  await loadSavedPrompts();
  await checkSelectedText();
  await checkPendingResult();
  
  // Configurar toggle de tema
  setupThemeToggle();
  
  // Configurar sistema de snippets
  setupSnippets();
});

// Configurar modal de resultado
function setupResultModal() {
  // Variáveis para armazenar o texto original e o resultado
  let currentOriginalText = '';
  let currentResultText = '';
  let currentSourceTabId = null;
  
  // Fechar modal
  elements.closeModal.addEventListener('click', () => {
    elements.resultModal.classList.remove('show');
  });
  
  // Fechar ao clicar fora
  elements.resultModal.addEventListener('click', (e) => {
    if (e.target === elements.resultModal) {
      elements.resultModal.classList.remove('show');
    }
  });
  
  // Copiar resultado
  elements.copyResult.addEventListener('click', async () => {
    const text = elements.transformedText.textContent;
    await navigator.clipboard.writeText(text);
    
    // Feedback visual
    elements.copyResult.classList.add('copied');
    const originalText = elements.copyResult.textContent;
    elements.copyResult.textContent = '✅ Copiado!';
    
    setTimeout(() => {
      elements.copyResult.classList.remove('copied');
      elements.copyResult.textContent = originalText;
    }, 1500);
    
    showMessage('Copiado para a área de transferência!', 'success');
  });
  
  // Substituir texto original
  elements.applyReplace.addEventListener('click', async () => {
    try {
      // Verificar se temos a tab ID de origem
      if (!currentSourceTabId) {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        currentSourceTabId = activeTab.id;
      }
      
      // Substituir o texto na página
      await chrome.scripting.executeScript({
        target: { tabId: currentSourceTabId },
        func: (resultText) => {
          // Funções para substituir o texto selecionado
          const replaceSelectedText = (newText) => {
            const selection = window.getSelection();
            if (!selection.rangeCount) return false;
            
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(newText));
            return true;
          };
          
          const replaceTextInActiveElement = (newText) => {
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
              const start = activeElement.selectionStart;
              const end = activeElement.selectionEnd;
              
              if (start !== undefined && end !== undefined) {
                const currentValue = activeElement.value;
                activeElement.value = currentValue.substring(0, start) + 
                                      newText + 
                                      currentValue.substring(end);
                activeElement.selectionStart = start;
                activeElement.selectionEnd = start + newText.length;
                return true;
              }
            }
            return false;
          };
          
          // Tentar substituir o texto
          const replacedInInput = replaceTextInActiveElement(resultText);
          if (replacedInInput) return true;
          
          const replacedInSelection = replaceSelectedText(resultText);
          if (replacedInSelection) return true;
          
          // Se não conseguimos substituir automaticamente, mostrar uma mensagem
          alert('Não foi possível substituir o texto automaticamente. O texto foi copiado para a área de transferência. Por favor, cole manualmente.');
          return false;
        },
        args: [currentResultText]
      });
      
      // Copiar o texto para a área de transferência como fallback
      await navigator.clipboard.writeText(currentResultText);
      
      // Fechar o modal
      elements.resultModal.classList.remove('show');
      
      // Mostrar mensagem de sucesso
      showMessage('Texto substituído com sucesso!', 'success');
      
      // Fechar o popup após substituição
      setTimeout(() => {
        window.close();
      }, 1000);
    } catch (error) {
      console.error('Erro ao substituir texto:', error);
      showMessage('Erro ao substituir texto. Texto copiado para a área de transferência.', 'error');
      await navigator.clipboard.writeText(currentResultText);
    }
  });
  
  // Salvar no histórico
  elements.saveToHistory.addEventListener('click', async () => {
    const { history = [] } = await chrome.storage.local.get(['history']);
    
    // Adicionar ao histórico com timestamp atual
    history.unshift({
      original: currentOriginalText,
      result: currentResultText,
      action: 'manual-save',
      timestamp: new Date().toISOString()
    });
    
    // Manter apenas últimos 50 itens
    if (history.length > 50) history.pop();
    
    await chrome.storage.local.set({ history });
    await loadHistory();
    
    showMessage('Salvo no histórico!', 'success');
  });
  
  // Botões de visualização
  elements.viewButtons.forEach(button => {
    button.addEventListener('click', () => {
      const viewMode = button.dataset.view;
      
      // Remover classe ativa de todos os botões
      elements.viewButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Configurar visualização
      switch (viewMode) {
        case 'side':
          elements.viewContainer.style.display = 'grid';
          elements.viewContainer.style.gridTemplateColumns = '1fr 1fr';
          elements.viewContainer.querySelector('.result-transformed').style.display = 'block';
          elements.viewContainer.querySelector('.result-original').style.display = 'block';
          elements.diffView.style.display = 'none';
          break;
          
        case 'original':
          elements.viewContainer.style.display = 'grid';
          elements.viewContainer.style.gridTemplateColumns = '1fr';
          elements.viewContainer.querySelector('.result-transformed').style.display = 'none';
          elements.viewContainer.querySelector('.result-original').style.display = 'block';
          elements.diffView.style.display = 'none';
          break;
          
        case 'result':
          elements.viewContainer.style.display = 'grid';
          elements.viewContainer.style.gridTemplateColumns = '1fr';
          elements.viewContainer.querySelector('.result-transformed').style.display = 'block';
          elements.viewContainer.querySelector('.result-original').style.display = 'none';
          elements.diffView.style.display = 'none';
          break;
          
        case 'diff':
          elements.viewContainer.style.display = 'none';
          elements.diffView.style.display = 'block';
          
          // Gerar visualização de diferenças
          if (currentOriginalText && currentResultText) {
            generateDiffView(currentOriginalText, currentResultText);
          }
          break;
      }
    });
  });
  
  // Toggle quebra de linha
  elements.toggleWordWrap.addEventListener('click', () => {
    elements.toggleWordWrap.classList.toggle('active');
    
    const textContents = document.querySelectorAll('.text-content');
    textContents.forEach(el => {
      el.classList.toggle('no-wrap');
    });
  });
  
  // Aumentar tamanho da fonte
  elements.increaseFont.addEventListener('click', () => {
    const textContents = document.querySelectorAll('.text-content');
    textContents.forEach(el => {
      const currentSize = parseFloat(window.getComputedStyle(el).fontSize);
      el.style.fontSize = (currentSize + 1) + 'px';
    });
  });
  
  // Diminuir tamanho da fonte
  elements.decreaseFont.addEventListener('click', () => {
    const textContents = document.querySelectorAll('.text-content');
    textContents.forEach(el => {
      const currentSize = parseFloat(window.getComputedStyle(el).fontSize);
      if (currentSize > 10) {
        el.style.fontSize = (currentSize - 1) + 'px';
      }
    });
  });
  
  // Função para gerar a visualização de diferenças
  function generateDiffView(original, result) {
    if (!original || !result) {
      elements.diffContent.innerHTML = 'Não há textos para comparar.';
      return;
    }
    
    try {
      // Função para calcular diferenças entre textos
      const diffTexts = (text1, text2) => {
        // Versão simples: identifica palavras adicionadas, removidas ou modificadas
        const words1 = text1.split(/\s+/);
        const words2 = text2.split(/\s+/);
        let result = '';
        
        let i = 0, j = 0;
        while (i < words1.length || j < words2.length) {
          if (i >= words1.length) {
            // Adições no final
            result += ` <ins>${words2[j]}</ins>`;
            j++;
          } else if (j >= words2.length) {
            // Remoções no final
            result += ` <del>${words1[i]}</del>`;
            i++;
          } else if (words1[i] === words2[j]) {
            // Palavras iguais
            result += ` ${words1[i]}`;
            i++;
            j++;
          } else {
            // Verificar se é uma modificação (remoção + adição)
            const nextMatchInOld = words1.slice(i + 1).findIndex(w => w === words2[j]);
            const nextMatchInNew = words2.slice(j + 1).findIndex(w => w === words1[i]);
            
            if (nextMatchInNew >= 0 && (nextMatchInOld < 0 || nextMatchInNew < nextMatchInOld)) {
              // Adição
              result += ` <ins>${words2[j]}</ins>`;
              j++;
            } else {
              // Remoção
              result += ` <del>${words1[i]}</del>`;
              i++;
            }
          }
        }
        
        return result.trim();
      };
      
      elements.diffContent.innerHTML = diffTexts(original, result);
    } catch (error) {
      console.error('Erro ao gerar diff:', error);
      elements.diffContent.innerHTML = 'Erro ao gerar visualização de diferenças.';
    }
  }
  
  // Expor métodos para uso externo
  window.showResultModal = (originalText, resultText, action, customPrompt = '', sourceTabId = null) => {
    // Armazenar valores para uso interno
    currentOriginalText = originalText || '';
    currentResultText = resultText || '';
    
    // Definir o tabId de origem, se fornecido
    if (sourceTabId) {
      currentSourceTabId = sourceTabId;
    } else {
      // Buscar tab ID atual
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0]) {
          currentSourceTabId = tabs[0].id;
        }
      });
    }
    
    // Definir título baseado na ação
    elements.resultModalTitle.textContent = modalTitles[action] || '✨ Resultado';
    
    // Se for prompt customizado, mostrar o prompt usado
    if (action === 'custom-prompt' && customPrompt) {
      elements.resultModalTitle.textContent += `: "${customPrompt.slice(0, 30)}${customPrompt.length > 30 ? '...' : ''}"`;
    }
    
    // Preencher textos
    elements.originalText.textContent = originalText || 'Texto original não disponível';
    elements.transformedText.textContent = resultText || 'Resultado não disponível';
    
    // Resetar visualização para o modo padrão
    elements.viewButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector('[data-view="side"]').classList.add('active');
    
    elements.viewContainer.style.display = 'grid';
    elements.viewContainer.style.gridTemplateColumns = '1fr 1fr';
    elements.viewContainer.querySelector('.result-transformed').style.display = 'block';
    elements.viewContainer.querySelector('.result-original').style.display = 'block';
    elements.diffView.style.display = 'none';
    
    // Mostrar modal
    elements.resultModal.classList.add('show');
  };
}

// Verificar se há resultado pendente para exibir
async function checkPendingResult() {
  const { pendingResult, lastProcessedTab } = await chrome.storage.local.get(['pendingResult', 'lastProcessedTab']);
  
  if (pendingResult) {
    // Tentar usar o tab ID armazenado se disponível
    let sourceTabId = null;
    if (lastProcessedTab && lastProcessedTab.id) {
      // Verificar se a tab ainda existe
      try {
        const tab = await chrome.tabs.get(lastProcessedTab.id);
        if (tab) {
          sourceTabId = tab.id;
        }
      } catch (error) {
        console.log('Tab de origem não encontrada:', error);
      }
    }
    
    showResultModal(
      pendingResult.original, 
      pendingResult.result, 
      pendingResult.action,
      pendingResult.customPrompt,
      sourceTabId
    );
    await chrome.storage.local.remove('pendingResult');
  }
}

// Carregar configurações
async function loadConfig() {
  const { apiKey, model } = await chrome.storage.local.get(['apiKey', 'model']);
  if (apiKey) elements.apiKey.value = apiKey;
  if (model) elements.model.value = model;
}

// Salvar configurações e testar API
elements.saveConfig.addEventListener('click', async () => {
  const apiKey = elements.apiKey.value.trim();
  const model = elements.model.value;
  
  if (!apiKey) {
    showMessage('Por favor, insira sua chave da API', 'error');
    return;
  }
  
  // Mostrar status de verificação
  const apiStatus = document.getElementById('api-status');
  const statusText = apiStatus.querySelector('.status-text');
  
  apiStatus.style.display = 'flex';
  apiStatus.className = 'api-status checking';
  statusText.textContent = 'Verificando chave da API...';
  
  try {
    // Testar a chave com uma requisição simples
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    if (response.ok) {
      await chrome.storage.local.set({ apiKey, model });
      
      apiStatus.className = 'api-status success';
      statusText.textContent = '✅ Chave da API válida e funcionando!';
      showMessage('Configurações salvas com sucesso!', 'success');
      
      // Ocultar status após 5 segundos
      setTimeout(() => {
        apiStatus.style.display = 'none';
      }, 5000);
    } else {
      apiStatus.className = 'api-status error';
      statusText.textContent = '❌ Chave da API inválida. Verifique e tente novamente.';
      showMessage('Chave da API inválida', 'error');
    }
  } catch (error) {
    apiStatus.className = 'api-status error';
    statusText.textContent = '❌ Erro ao verificar a chave. Verifique sua conexão.';
    showMessage('Erro ao verificar a chave', 'error');
  }
});

// Toggle visibilidade da chave
elements.toggleKey.addEventListener('click', () => {
  const input = elements.apiKey;
  if (input.type === 'password') {
    input.type = 'text';
    elements.toggleKey.textContent = '🙈';
  } else {
    input.type = 'password';
    elements.toggleKey.textContent = '👁️';
  }
});

// Sistema de abas
elements.tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const targetTab = tab.dataset.tab;
    
    elements.tabs.forEach(t => t.classList.remove('active'));
    elements.tabContents.forEach(c => c.classList.remove('active'));
    
    tab.classList.add('active');
    document.getElementById(targetTab).classList.add('active');
  });
});

// Carregar estatísticas
async function loadStats() {
  const { history = [] } = await chrome.storage.local.get(['history']);
  const today = new Date().toDateString();
  
  const totalUses = history.length;
  const todayUses = history.filter(item => 
    new Date(item.timestamp).toDateString() === today
  ).length;
  
  elements.totalUses.textContent = totalUses;
  elements.todayUses.textContent = todayUses;
}

// Verificar texto selecionado
async function checkSelectedText() {
  const { selectedText } = await chrome.storage.local.get(['selectedText']);
  
  if (selectedText) {
    elements.selectedTextPreview.style.display = 'block';
    const charCount = selectedText.length;
    const preview = selectedText.slice(0, 200) + (selectedText.length > 200 ? '...' : '');
    
    elements.selectedTextContent.innerHTML = `
      ${preview}
      <div style="margin-top: 8px; font-size: 12px; color: #666;">
        ${charCount} caracteres selecionados
        <span class="estimated-time">⏱️ ~${Math.ceil(charCount / 100)} segundos</span>
      </div>
    `;
    elements.executeCustom.disabled = false;
  }
}

// Adicionar contador de caracteres para o prompt
elements.customPrompt.addEventListener('input', (e) => {
  const charCount = e.target.value.length;
  const counter = document.getElementById('prompt-counter');
  if (counter) {
    counter.textContent = `${charCount} caracteres`;
    if (charCount > 500) {
      counter.style.color = '#ff6b6b';
    } else if (charCount > 300) {
      counter.style.color = '#ffa500';
    } else {
      counter.style.color = '#999';
    }
  }
});

  // Executar prompt customizado com debounce
  let isProcessing = false;
  elements.executeCustom.addEventListener('click', async () => {
    if (isProcessing) return; // Evitar múltiplos cliques
    
    const prompt = elements.customPrompt.value.trim();
    const { selectedText } = await chrome.storage.local.get(['selectedText']);
    
    if (!prompt) {
      showMessage('Por favor, insira um prompt', 'error');
      return;
    }
    
    if (!selectedText) {
      showMessage('Nenhum texto selecionado', 'error');
      return;
    }
    
    isProcessing = true;
    elements.executeCustom.disabled = true;
    elements.executeCustom.innerHTML = '<span class="processing-indicator"></span> Processando...';
    
    try {
      const { apiKey, model = 'gpt-3.5-turbo' } = await chrome.storage.local.get(['apiKey', 'model']);
      
      if (!apiKey) {
        showMessage('Configure sua chave da API primeiro', 'error');
        return;
      }
      
      const fullPrompt = `${prompt}\n\nTexto: ${selectedText}`;
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: fullPrompt }],
          temperature: 0.7,
          max_tokens: 1000
        })
      });
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      const data = await response.json();
      const result = data.choices[0].message.content;
      
      // Mostrar o resultado no modal
      showResultModal(selectedText, result, 'custom-prompt', prompt);
      
      // Salvar no histórico
      const { history = [] } = await chrome.storage.local.get(['history']);
      history.unshift({
        original: selectedText,
        result,
        action: 'custom-prompt',
        prompt,
        timestamp: new Date().toISOString()
      });
      
      if (history.length > 50) history.pop();
      await chrome.storage.local.set({ history });
      
      // Limpar texto selecionado
      await chrome.storage.local.remove('selectedText');
      
      // Recarregar
      await loadStats();
      await loadHistory();
      
      // Feedback de conclusão
      elements.executeCustom.innerHTML = '✅ Concluído!';
      setTimeout(() => {
        elements.executeCustom.innerHTML = '🚀 Executar Prompt';
        elements.executeCustom.disabled = false;
        isProcessing = false;
      }, 1500);
      
    } catch (error) {
      showMessage(`Erro: ${error.message}`, 'error');
      elements.executeCustom.innerHTML = '❌ Erro!';
      setTimeout(() => {
        elements.executeCustom.innerHTML = '🚀 Executar Prompt';
        elements.executeCustom.disabled = false;
        isProcessing = false;
      }, 1500);
    }
  });
  
// Carregar histórico
async function loadHistory() {
  const { history = [] } = await chrome.storage.local.get(['history']);
  
  if (history.length === 0) {
    elements.historyList.innerHTML = '<p class="empty-state">Nenhum item no histórico ainda.</p>';
    return;
  }
  
  elements.historyList.innerHTML = history.slice(0, 10).map(item => {
    const date = new Date(item.timestamp);
    
    // Validar se os dados existem
    const originalText = item.original || 'Texto não disponível';
    const resultText = item.result || 'Resultado não disponível';
    
    return `
      <div class="history-item">
        <div class="history-header">
          <span class="history-action">${actionLabels[item.action] || item.action}</span>
          <span class="history-date">${date.toLocaleString('pt-BR')}</span>
        </div>
        <div class="history-content">
          <div class="history-original">
            <strong>Original:</strong> ${originalText.slice(0, 100)}${originalText.length > 100 ? '...' : ''}
          </div>
          <div class="history-result">
            <strong>Resultado:</strong> ${resultText.slice(0, 100)}${resultText.length > 100 ? '...' : ''}
            <button class="btn-copy" data-text="${encodeURIComponent(resultText)}">
              📋 Copiar
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  // Adicionar listener para visualizar histórico
  addHistoryItemListeners();
  
  // Adicionar listeners para botões de copiar
  document.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const button = e.target;
      const text = decodeURIComponent(button.dataset.text);
      
      try {
        await navigator.clipboard.writeText(text);
        
        // Adicionar feedback visual
        button.classList.add('copied');
        const originalText = button.textContent;
        button.textContent = '✅ Copiado!';
        
        setTimeout(() => {
          button.classList.remove('copied');
          button.textContent = originalText;
        }, 1500);
        
        showMessage('Copiado!', 'success');
      } catch (error) {
        showMessage('Erro ao copiar: ' + error.message, 'error');
      }
    });
  });
  
// Adicionar listeners para itens do histórico
function addHistoryItemListeners() {
  document.querySelectorAll('.history-item').forEach(item => {
    item.addEventListener('click', (e) => {
      // Pular se clicou no botão de copiar
      if (e.target.classList.contains('btn-copy') || e.target.closest('.btn-copy')) {
        return;
      }
      
      // Obter o texto original e resultado do item
      const original = item.querySelector('.history-original').textContent.replace('Original: ', '');
      const result = item.querySelector('.history-result').textContent.replace('Resultado: ', '').split('📋 Copiar')[0];
      const actionEl = item.querySelector('.history-action');
      const action = Object.keys(actionLabels).find(key => 
        actionLabels[key] === actionEl.textContent
      ) || 'custom-prompt';
      
      // Mostrar no modal
      showResultModal(original, result, action);
    });
  });
}
}

// Limpar histórico
elements.clearHistory.addEventListener('click', async () => {
  if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
    await chrome.storage.local.remove('history');
    await loadHistory();
    await loadStats();
    showMessage('Histórico limpo', 'success');
  }
});

// Prompts salvos
async function loadSavedPrompts() {
  const { savedPrompts = [] } = await chrome.storage.local.get(['savedPrompts']);
  
  if (savedPrompts.length === 0) {
    elements.savedPromptsList.innerHTML = '<p class="empty-state">Nenhum prompt salvo ainda.</p>';
    return;
  }
  
  elements.savedPromptsList.innerHTML = savedPrompts.map((prompt, index) => `
    <div class="saved-prompt-item">
      <span class="prompt-text">${prompt}</span>
      <div class="prompt-actions">
        <button class="btn-use" data-prompt="${encodeURIComponent(prompt)}">Usar</button>
        <button class="btn-delete" data-index="${index}">🗑️</button>
      </div>
    </div>
  `).join('');
  
  // Adicionar listeners
  document.querySelectorAll('.btn-use').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const prompt = decodeURIComponent(e.target.dataset.prompt);
      elements.customPrompt.value = prompt;
    });
  });
  
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const index = parseInt(e.target.dataset.index);
      savedPrompts.splice(index, 1);
      await chrome.storage.local.set({ savedPrompts });
      await loadSavedPrompts();
    });
  });
}

// Salvar prompt
elements.savePrompt.addEventListener('click', async () => {
  const prompt = elements.customPrompt.value.trim();
  
  if (!prompt) {
    showMessage('Digite um prompt para salvar', 'error');
    return;
  }
  
  const { savedPrompts = [] } = await chrome.storage.local.get(['savedPrompts']);
  
  if (savedPrompts.includes(prompt)) {
    showMessage('Este prompt já está salvo', 'error');
    return;
  }
  
  savedPrompts.push(prompt);
  await chrome.storage.local.set({ savedPrompts });
  await loadSavedPrompts();
  showMessage('Prompt salvo!', 'success');
});

// Mostrar mensagem
function showMessage(text, type = 'info') {
  elements.message.textContent = text;
  elements.message.className = `message ${type} show`;
  
  setTimeout(() => {
    elements.message.classList.remove('show');
  }, 3000);
}

// Função para configurar o toggle de tema
function setupThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  
  // Verificar se há tema salvo
  chrome.storage.local.get(['theme'], function(result) {
    if (result.theme === 'dark') {
      body.classList.add('dark-theme');
      themeToggle.textContent = '☀️';
    } else {
      themeToggle.textContent = '🌙';
    }
  });
  
  // Adicionar evento de clique ao botão
  themeToggle.addEventListener('click', function() {
    const isDarkTheme = body.classList.toggle('dark-theme');
    const newTheme = isDarkTheme ? 'dark' : 'light';
    const newIcon = isDarkTheme ? '☀️' : '🌙';
    
    // Atualizar ícone
    themeToggle.textContent = newIcon;
    
    // Salvar preferência
    chrome.storage.local.set({ theme: newTheme });
  });
}

// Função para gerenciar snippets
function setupSnippets() {
  const snippetNameInput = document.getElementById('snippetName');
  const snippetContentInput = document.getElementById('snippetContent');
  const saveSnippetBtn = document.getElementById('saveSnippet');
  const snippetsList = document.getElementById('snippetsList');
  
  // Carregar snippets existentes
  function loadSnippets() {
    chrome.storage.local.get(['snippets'], function(result) {
      const snippets = result.snippets || [];
      
      if (snippets.length === 0) {
        snippetsList.innerHTML = '<p class="empty-state">Nenhum snippet criado ainda.</p>';
        return;
      }
      
      snippetsList.innerHTML = '';
      
      snippets.forEach((snippet, index) => {
        const snippetElement = document.createElement('div');
        snippetElement.className = 'snippet-item';
        snippetElement.innerHTML = `
          <div class="snippet-name">${snippet.name}</div>
          <div class="snippet-content">${snippet.content}</div>
          <div class="snippet-actions">
            <button class="use-snippet" data-index="${index}">Usar</button>
            <button class="edit-snippet" data-index="${index}">Editar</button>
            <button class="delete-snippet" data-index="${index}">Excluir</button>
          </div>
        `;
        
        snippetsList.appendChild(snippetElement);
      });
      
      // Adicionar eventos para os botões
      document.querySelectorAll('.use-snippet').forEach(btn => {
        btn.addEventListener('click', function() {
          const index = parseInt(this.getAttribute('data-index'));
          const snippets = result.snippets || [];
          
          if (snippets[index]) {
            // Inserir o conteúdo do snippet no campo de prompt personalizado
            const customPromptInput = document.getElementById('customPrompt');
            if (customPromptInput) {
              customPromptInput.value = snippets[index].content;
              
              // Mudar para a aba de prompt personalizado
              const customTab = document.querySelector('[data-tab="custom"]');
              if (customTab) {
                customTab.click();
              }
            }
          }
        });
      });
      
      document.querySelectorAll('.edit-snippet').forEach(btn => {
        btn.addEventListener('click', function() {
          const index = parseInt(this.getAttribute('data-index'));
          const snippets = result.snippets || [];
          
          if (snippets[index]) {
            snippetNameInput.value = snippets[index].name;
            snippetContentInput.value = snippets[index].content;
            
            // Armazenar o índice do snippet sendo editado
            snippetNameInput.dataset.editIndex = index;
          }
        });
      });
      
      document.querySelectorAll('.delete-snippet').forEach(btn => {
        btn.addEventListener('click', function() {
          const index = parseInt(this.getAttribute('data-index'));
          const snippets = result.snippets || [];
          
          if (confirm('Tem certeza que deseja excluir este snippet?')) {
            snippets.splice(index, 1);
            chrome.storage.local.set({ snippets });
            loadSnippets();
            showMessage('Snippet excluído com sucesso', 'success');
          }
        });
      });
    });
  }
  
  // Salvar um novo snippet ou atualizar existente
  saveSnippetBtn.addEventListener('click', function() {
    const name = snippetNameInput.value.trim();
    const content = snippetContentInput.value.trim();
    
    if (!name || !content) {
      showMessage('Por favor, preencha todos os campos', 'error');
      return;
    }
    
    chrome.storage.local.get(['snippets'], function(result) {
      let snippets = result.snippets || [];
      const editIndex = snippetNameInput.dataset.editIndex;
      
      if (editIndex !== undefined) {
        // Estamos editando um snippet existente
        snippets[editIndex] = { name, content };
        delete snippetNameInput.dataset.editIndex;
        showMessage('Snippet atualizado com sucesso', 'success');
      } else {
        // Novo snippet
        snippets.push({ name, content });
        showMessage('Snippet salvo com sucesso', 'success');
      }
      
      chrome.storage.local.set({ snippets });
      
      // Limpar campos
      snippetNameInput.value = '';
      snippetContentInput.value = '';
      
      // Recarregar lista
      loadSnippets();
    });
  });
  
  // Carregar snippets ao inicializar
  loadSnippets();
} 