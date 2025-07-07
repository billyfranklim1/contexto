// Criar menu de contexto quando a extensão for instalada
chrome.runtime.onInstalled.addListener(() => {
  // Verificar e configurar tema inicial
  chrome.storage.local.get(['theme'], function(result) {
    if (!result.theme) {
      // Detectar tema do sistema
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        chrome.storage.local.set({ theme: 'dark' });
      } else {
        chrome.storage.local.set({ theme: 'light' });
      }
    }
  });
  
  // Menu principal
  chrome.contextMenus.create({
    id: "main-menu",
    title: "🧠 IA Context Menu",
    contexts: ["selection"]
  });
  
  // Opções básicas
  chrome.contextMenus.create({
    id: "rewrite-text",
    parentId: "main-menu",
    title: "🧠 Reescrever com IA",
    contexts: ["selection"]
  });
  
  chrome.contextMenus.create({
    id: "fix-grammar",
    parentId: "main-menu",
    title: "✏️ Corrigir Gramática",
    contexts: ["selection"]
  });
  
  chrome.contextMenus.create({
    id: "summarize",
    parentId: "main-menu",
    title: "📝 Resumir Texto",
    contexts: ["selection"]
  });
  
  // Separador
  chrome.contextMenus.create({
    id: "separator1",
    parentId: "main-menu",
    type: "separator",
    contexts: ["selection"]
  });
  
  // Novas opções
  chrome.contextMenus.create({
    id: "make-formal",
    parentId: "main-menu",
    title: "📧 Tornar Formal",
    contexts: ["selection"]
  });
  
  chrome.contextMenus.create({
    id: "make-informal",
    parentId: "main-menu",
    title: "😊 Tornar Informal",
    contexts: ["selection"]
  });
  
  chrome.contextMenus.create({
    id: "bullet-points",
    parentId: "main-menu",
    title: "🎯 Criar Bullet Points",
    contexts: ["selection"]
  });
  
  chrome.contextMenus.create({
    id: "expand-text",
    parentId: "main-menu",
    title: "🔍 Expandir Texto",
    contexts: ["selection"]
  });
  
  chrome.contextMenus.create({
    id: "reduce-text",
    parentId: "main-menu",
    title: "✂️ Reduzir 50%",
    contexts: ["selection"]
  });
  
  // Traduções
  chrome.contextMenus.create({
    id: "separator2",
    parentId: "main-menu",
    type: "separator",
    contexts: ["selection"]
  });
  
  chrome.contextMenus.create({
    id: "translate-menu",
    parentId: "main-menu",
    title: "🌐 Traduzir para...",
    contexts: ["selection"]
  });
  
  chrome.contextMenus.create({
    id: "translate-en",
    parentId: "translate-menu",
    title: "🇺🇸 Inglês",
    contexts: ["selection"]
  });
  
  chrome.contextMenus.create({
    id: "translate-es",
    parentId: "translate-menu",
    title: "🇪🇸 Espanhol",
    contexts: ["selection"]
  });
  
  chrome.contextMenus.create({
    id: "translate-pt",
    parentId: "translate-menu",
    title: "🇧🇷 Português",
    contexts: ["selection"]
  });
  
  // Separador final
  chrome.contextMenus.create({
    id: "separator3",
    parentId: "main-menu",
    type: "separator",
    contexts: ["selection"]
  });
  
  chrome.contextMenus.create({
    id: "custom-prompt",
    parentId: "main-menu",
    title: "🪄 Prompt Personalizado",
    contexts: ["selection"]
  });
});

// Lidar com cliques no menu de contexto
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!info.selectionText) return;
  
  // Buscar chave da API armazenada
  const { apiKey } = await chrome.storage.local.get(['apiKey']);
  
  if (!apiKey) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon-48.png",
      title: "Erro: Chave da API não configurada",
      message: "Por favor, configure sua chave da OpenAI clicando no ícone da extensão."
    });
    return;
  }
  
  let prompt = "";
  
  switch (info.menuItemId) {
    case "rewrite-text":
      prompt = `Reescreva o seguinte texto de forma clara, concisa e profissional. Mantenha o mesmo idioma:\n\n${info.selectionText}`;
      break;
    case "fix-grammar":
      prompt = `Corrija a gramática e ortografia do seguinte texto, mantendo o estilo original:\n\n${info.selectionText}`;
      break;
    case "summarize":
      prompt = `Faça um resumo conciso do seguinte texto, destacando os pontos principais:\n\n${info.selectionText}`;
      break;
    case "make-formal":
      prompt = `Reescreva o seguinte texto em um tom formal e profissional, adequado para comunicação empresarial:\n\n${info.selectionText}`;
      break;
    case "make-informal":
      prompt = `Reescreva o seguinte texto em um tom informal e amigável, como se estivesse conversando com um amigo:\n\n${info.selectionText}`;
      break;
    case "bullet-points":
      prompt = `Transforme o seguinte texto em bullet points organizados e concisos:\n\n${info.selectionText}`;
      break;
    case "expand-text":
      prompt = `Expanda o seguinte texto, adicionando mais detalhes, exemplos e explicações para torná-lo mais completo:\n\n${info.selectionText}`;
      break;
    case "reduce-text":
      prompt = `Reduza o seguinte texto em aproximadamente 50%, mantendo apenas as informações mais importantes:\n\n${info.selectionText}`;
      break;
    case "translate-en":
      prompt = `Traduza o seguinte texto para inglês, mantendo o tom e estilo original:\n\n${info.selectionText}`;
      break;
    case "translate-es":
      prompt = `Traduza o seguinte texto para espanhol, mantendo o tom e estilo original:\n\n${info.selectionText}`;
      break;
    case "translate-pt":
      prompt = `Traduza o seguinte texto para português brasileiro, mantendo o tom e estilo original:\n\n${info.selectionText}`;
      break;
    case "custom-prompt":
      // Abrir popup para prompt personalizado
      chrome.action.openPopup();
      chrome.storage.local.set({ selectedText: info.selectionText });
      return;
  }
  
  try {
    // Mostrar notificação de processamento com ID único
    const notificationId = `processing-${Date.now()}`;
    chrome.notifications.create(notificationId, {
      type: "basic",
      iconUrl: "icon-48.png",
      title: "🔄 Iniciando processamento...",
      message: "Conectando com a IA...",
      requireInteraction: true
    });
    
    // Criar indicador de progresso na página
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // Remover indicador anterior se existir
        const existingIndicator = document.getElementById('ia-context-menu-progress');
        if (existingIndicator) existingIndicator.remove();
        
        // Criar novo indicador
        const progressIndicator = document.createElement('div');
        progressIndicator.id = 'ia-context-menu-progress';
        progressIndicator.innerHTML = `
          <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 12px;
            padding: 16px 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 999999;
            min-width: 280px;
            font-family: system-ui, -apple-system, sans-serif;
            animation: slideIn 0.3s ease-out;
          ">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="
                width: 24px;
                height: 24px;
                border: 3px solid #e0e0e0;
                border-top-color: #667eea;
                border-radius: 50%;
                animation: spin 1s linear infinite;
              "></div>
              <div>
                <div style="font-weight: 600; color: #1d1d1f; margin-bottom: 2px;">
                  Processando com IA...
                </div>
                <div style="font-size: 12px; color: #666;" id="progress-status">
                  Conectando com a API...
                </div>
              </div>
            </div>
            <div style="
              margin-top: 10px;
              height: 4px;
              background: #e0e0e0;
              border-radius: 2px;
              overflow: hidden;
            ">
              <div style="
                height: 100%;
                background: linear-gradient(90deg, #667eea, #764ba2);
                width: 20%;
                border-radius: 2px;
                animation: progress 2s ease-out;
              " id="progress-bar"></div>
            </div>
          </div>
          <style>
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            @keyframes slideIn {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
            @keyframes progress {
              from { width: 0%; }
              to { width: 80%; }
            }
          </style>
        `;
        document.body.appendChild(progressIndicator);
      }
    });
    
    // Atualizar status para "processando"
    setTimeout(() => {
      chrome.notifications.update(notificationId, {
        title: "🧠 IA processando...",
        message: `Analisando ${info.selectionText.slice(0, 50)}...`
      });
      
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const status = document.getElementById('progress-status');
          const progressBar = document.getElementById('progress-bar');
          if (status) status.textContent = 'IA analisando seu texto...';
          if (progressBar) progressBar.style.width = '60%';
        }
      });
    }, 1000);
    
    // Buscar modelo selecionado
    const { model = 'gpt-3.5-turbo' } = await chrome.storage.local.get(['model']);
    
    // Chamar API da OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }
    
    const data = await response.json();
    const result = data.choices[0].message.content;
    
    // Atualizar progresso para completo
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const status = document.getElementById('progress-status');
        const progressBar = document.getElementById('progress-bar');
        if (status) status.textContent = 'Processamento concluído!';
        if (progressBar) {
          progressBar.style.width = '100%';
          progressBar.style.transition = 'width 0.3s ease-out';
        }
      }
    });
    
    // Armazenar o resultado para mostrar no popup
    await chrome.storage.local.set({ 
      pendingResult: {
        original: info.selectionText,
        result: result,
        action: info.menuItemId
      }
    });
    
    // Mostrar feedback visual na página
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // Remover indicador de progresso
        setTimeout(() => {
          const progressIndicator = document.getElementById('ia-context-menu-progress');
          if (progressIndicator) {
            progressIndicator.style.transition = 'opacity 0.3s ease-out';
            progressIndicator.style.opacity = '0';
            setTimeout(() => progressIndicator.remove(), 300);
          }
        }, 500);
        
        // Criar notificação de sucesso
        const notification = document.createElement('div');
        notification.innerHTML = `
          <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 999999;
            font-family: system-ui, -apple-system, sans-serif;
            animation: slideIn 0.3s ease-out;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
          ">
            <span style="font-size: 20px;">✅</span>
            <div>
              <div style="font-weight: 600; margin-bottom: 2px;">Texto processado!</div>
              <div style="font-size: 13px; opacity: 0.9;">Clique aqui ou no ícone da extensão</div>
            </div>
          </div>
        `;
        
        notification.addEventListener('click', () => {
          chrome.runtime.sendMessage({ action: 'openPopup' });
          notification.remove();
        });
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 8000);
      }
    });
    
    // Notificação de sucesso persistente
    chrome.notifications.clear(notificationId);
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon-48.png",
      title: "✅ Texto processado com sucesso!",
      message: "Clique no ícone da extensão para ver o resultado.",
      requireInteraction: true
    });
    
    // Abrir popup para mostrar o resultado
    chrome.action.openPopup();
    
    // Salvar no histórico
    const { history = [] } = await chrome.storage.local.get(['history']);
    history.unshift({
      original: info.selectionText,
      result: result,
      action: info.menuItemId,
      timestamp: new Date().toISOString()
    });
    
    // Manter apenas últimos 50 itens
    if (history.length > 50) history.pop();
    
    await chrome.storage.local.set({ history });
    
    // Armazenar também o tabId da origem para possibilitar substituição
    await chrome.storage.local.set({ 
      lastProcessedTab: {
        id: tab.id,
        url: tab.url,
        timestamp: new Date().toISOString()
      } 
    });
    
  } catch (error) {
    // Remover indicador de progresso e mostrar erro
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // Remover indicador de progresso
        const progressIndicator = document.getElementById('ia-context-menu-progress');
        if (progressIndicator) progressIndicator.remove();
        
        // Mostrar notificação de erro
        const notification = document.createElement('div');
        notification.innerHTML = `
          <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 999999;
            font-family: system-ui, -apple-system, sans-serif;
            animation: slideIn 0.3s ease-out;
            display: flex;
            align-items: center;
            gap: 10px;
          ">
            <span style="font-size: 20px;">❌</span>
            <div>
              <div style="font-weight: 600; margin-bottom: 2px;">Erro ao processar</div>
              <div style="font-size: 13px; opacity: 0.9;">Tente novamente em alguns instantes</div>
            </div>
            <button style="
              background: rgba(255,255,255,0.2);
              border: 1px solid rgba(255,255,255,0.3);
              color: white;
              padding: 4px 12px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 12px;
              margin-left: 10px;
            " onclick="this.parentElement.parentElement.remove()">
              Fechar
            </button>
          </div>
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 10000);
      }
    });
    
    chrome.notifications.clear(notificationId);
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon-48.png",
      title: "❌ Erro ao processar",
      message: `${error.message}. Tente novamente.`,
      requireInteraction: true
    });
  }
});

// Função para processar com prompt customizado
async function processWithCustomPrompt(prompt, text) {
  const { apiKey, model = 'gpt-3.5-turbo' } = await chrome.storage.local.get(['apiKey', 'model']);
  
  if (!apiKey) {
    throw new Error('Chave da API não configurada');
  }
  
  const fullPrompt = `${prompt}\n\nTexto: ${text}`;
  
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
  return data.choices[0].message.content;
}

// Escutar mensagens do popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "processCustomPrompt") {
    processWithCustomPrompt(request.prompt, request.text).then(sendResponse);
    return true; // Indica resposta assíncrona
  }
});

// Escutar comandos de atalhos de teclado
chrome.commands.onCommand.addListener(async (command) => {
  // Obter texto selecionado da aba ativa
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString()
    });
    
    const selectedText = result[0].result;
    
    if (!selectedText) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon-48.png",
        title: "Nenhum texto selecionado",
        message: "Por favor, selecione um texto antes de usar o atalho."
      });
      return;
    }
    
    let action;
    switch (command) {
      case "rewrite-selection":
        action = "rewrite-text";
        break;
      case "fix-grammar-selection":
        action = "fix-grammar";
        break;
      default:
        return;
    }
    
    // Simular clique no menu para reutilizar a lógica existente
    chrome.contextMenus.onClicked.dispatch({
      menuItemId: action,
      selectionText: selectedText
    }, tab);
    
  } catch (error) {
    console.error('Erro ao executar comando:', error);
  }
}); 